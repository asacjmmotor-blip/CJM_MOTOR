const { supabaseFetch, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendResponse(res, 200, true, 'OK');
  }
  if (req.method !== 'GET') {
    return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
  }

  try {
    const q = (req.query.q || req.query.nopol || '').trim();
    if (!q) {
      return sendResponse(res, 200, true, 'Pencarian kosong.', []);
    }

    const cleanQ = q.toUpperCase().replace(/\s+/g, '');

    // Fetch all vehicles with customers and detailed services history
    const { ok, status, data: vehicles } = await supabaseFetch('vehicles?select=*,customers(*),services(*,service_items(*))&order=created_at.desc');
    if (!ok) {
      return sendResponse(res, status, false, 'Gagal melakukan pencarian kendaraan: ' + (vehicles ? vehicles.message : ''));
    }

    const reqPin = (req.query.pin || '').trim();

    const filteredVehicles = (vehicles || []).filter(v => {
      const vCleanPlate = (v.plate_number || '').toUpperCase().replace(/\s+/g, '');
      const vBrand = (v.brand || '').toLowerCase();
      const vModel = (v.model || '').toLowerCase();
      const vCustName = v.customers ? (v.customers.name || '').toLowerCase() : '';

      const matchQuery = vCleanPlate.includes(cleanQ) ||
                         vBrand.includes(q.toLowerCase()) ||
                         vModel.includes(q.toLowerCase()) ||
                         vCustName.includes(q.toLowerCase());

      if (!matchQuery) return false;

      // PIN verification if PIN is supplied in request
      if (reqPin) {
        const hasMatchingPin = (v.services || []).some(s => s.pin_code && String(s.pin_code).trim() === reqPin);
        if (!hasMatchingPin) return false;
      }

      return true;
    });

    const results = filteredVehicles.map(v => {
      const sortedServices = (v.services || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return {
        id: v.id,
        plate_number: v.plate_number,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        customer_id: v.customer_id,
        customer_name: v.customers ? v.customers.name : 'Umum / Non-Member',
        customer_phone: v.customers ? v.customers.phone : '-',
        history_count: sortedServices.length,
        vehicle: {
          id: v.id,
          plate_number: v.plate_number,
          brand: v.brand,
          model: v.model,
          year: v.year,
          color: v.color
        },
        services: sortedServices
      };
    });

    if (results.length === 0) {
      return sendResponse(res, 404, false, `Data kendaraan dengan nomor polisi / pencarian "${q}" tidak ditemukan.`);
    }

    return sendResponse(res, 200, true, 'Hasil pencarian kendaraan berhasil ditemukan.', results);
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
