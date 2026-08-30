const { supabaseFetch, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
  }

  try {
    const id = req.query.id;
    const code = req.query.code;

    if (!id && !code) {
      return sendResponse(res, 400, false, 'ID atau Kode Service wajib diisi.');
    }

    let endpoint = 'services?select=*,vehicles(*,customers(*)),service_items(*)&limit=1';
    if (id) {
      endpoint += `&id=eq.${id}`;
    } else if (code) {
      endpoint += `&service_code=eq.${encodeURIComponent(code)}`;
    }

    const { ok, status, data } = await supabaseFetch(endpoint);
    if (!ok || !data || data.length === 0) {
      return sendResponse(res, 404, false, 'Data service tidak ditemukan.');
    }

    const s = data[0];
    const v = s.vehicles || {};
    const c = v.customers || {};
    const items = s.service_items || [];
    const totalCost = items.length > 0
      ? items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0)
      : (parseFloat(s.total_cost) || 0);

    const result = {
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
      year: v.year || null,
      color: v.color || '-',
      customer_id: v.customer_id,
      customer_name: c.name || 'Umum / Non-Member',
      customer_phone: c.phone || '-',
      customer_address: c.address || '-',
      items,
      created_at: s.created_at
    };

    return sendResponse(res, 200, true, 'Detail service berhasil dimuat.', result);
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
