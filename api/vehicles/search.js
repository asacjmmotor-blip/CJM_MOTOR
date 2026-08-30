const { supabaseFetch, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
  }

  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return sendResponse(res, 200, true, 'Pencarian kosong.', []);
    }

    const cleanQ = q.toUpperCase().replace(/\s+/g, '');

    // Fetch all vehicles with customers and services to match clean plate number
    const { ok, status, data: vehicles } = await supabaseFetch('vehicles?select=*,customers(*),services(id)');
    if (!ok) {
      return sendResponse(res, status, false, 'Gagal melakukan pencarian kendaraan.');
    }

    const results = (vehicles || []).filter(v => {
      const vCleanPlate = (v.plate_number || '').toUpperCase().replace(/\s+/g, '');
      const vBrand = (v.brand || '').toLowerCase();
      const vModel = (v.model || '').toLowerCase();
      const vCustName = v.customers ? (v.customers.name || '').toLowerCase() : '';

      return vCleanPlate.includes(cleanQ) ||
             vBrand.includes(q.toLowerCase()) ||
             vModel.includes(q.toLowerCase()) ||
             vCustName.includes(q.toLowerCase());
    }).map(v => ({
      id: v.id,
      plate_number: v.plate_number,
      brand: v.brand,
      model: v.model,
      year: v.year,
      color: v.color,
      customer_id: v.customer_id,
      customer_name: v.customers ? v.customers.name : 'Umum / Non-Member',
      customer_phone: v.customers ? v.customers.phone : '-',
      history_count: v.services ? v.services.length : 0
    }));

    return sendResponse(res, 200, true, 'Hasil pencarian kendaraan.', results);
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
