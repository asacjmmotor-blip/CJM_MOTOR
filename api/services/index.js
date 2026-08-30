const { supabaseFetch, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
  }

  try {
    const statusFilter = req.query.status || '';
    const q = (req.query.q || '').trim();

    let endpoint = 'services?select=*,vehicles(*,customers(*)),service_items(*)&order=created_at.desc';
    if (statusFilter && statusFilter !== 'Semua') {
      endpoint += `&status=eq.${encodeURIComponent(statusFilter)}`;
    }

    const { ok, status, data } = await supabaseFetch(endpoint);
    if (!ok) {
      return sendResponse(res, status, false, 'Gagal mengambil data service: ' + (data.message || ''));
    }

    let services = (data || []).map(s => {
      const v = s.vehicles || {};
      const c = v.customers || {};
      const items = s.service_items || [];
      const totalCost = items.length > 0
        ? items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0)
        : (parseFloat(s.total_cost) || 0);

      return {
        id: s.id,
        service_code: s.service_code,
        service_date: s.service_date,
        service_type: s.service_type,
        complaint: s.complaint,
        mechanic: s.mechanic || '-',
        status: s.status,
        notes: s.notes || '',
        total_cost: totalCost,
        attachment_url: s.attachment_url,
        vehicle_id: s.vehicle_id,
        plate_number: v.plate_number || '-',
        brand: v.brand || '-',
        model: v.model || '-',
        customer_name: c.name || 'Umum / Non-Member',
        customer_phone: c.phone || '-',
        items,
        created_at: s.created_at
      };
    });

    if (q) {
      const cleanQ = q.toUpperCase().replace(/\s+/g, '');
      services = services.filter(s => {
        return s.service_code.toUpperCase().includes(cleanQ) ||
               s.plate_number.toUpperCase().replace(/\s+/g, '').includes(cleanQ) ||
               s.brand.toLowerCase().includes(q.toLowerCase()) ||
               s.model.toLowerCase().includes(q.toLowerCase()) ||
               s.customer_name.toLowerCase().includes(q.toLowerCase()) ||
               s.mechanic.toLowerCase().includes(q.toLowerCase());
      });
    }

    return sendResponse(res, 200, true, 'Data service berhasil dimuat.', services);
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
