const { supabaseFetch, parseReqBody, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  const method = req.method;
  const id = req.query.id || (req.body ? req.body.id : null);

  if (method === 'GET') {
    if (!id) return sendResponse(res, 400, false, 'ID Kendaraan wajib diisi.');
    try {
      const { ok, status, data } = await supabaseFetch(`vehicles?id=eq.${id}&select=*,customers(*),services(*,service_items(*))&limit=1`);
      if (!ok || !data || data.length === 0) {
        return sendResponse(res, 404, false, 'Data kendaraan tidak ditemukan.');
      }

      const v = data[0];
      const detail = {
        id: v.id,
        plate_number: v.plate_number,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        customer_id: v.customer_id,
        customer_name: v.customers ? v.customers.name : 'Umum / Non-Member',
        customer_phone: v.customers ? v.customers.phone : '-',
        services: (v.services || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      };

      return sendResponse(res, 200, true, 'Detail kendaraan berhasil dimuat.', detail);
    } catch (err) {
      return sendResponse(res, 500, false, 'Server Error: ' + err.message);
    }
  }

  if (method === 'PUT') {
    try {
      const body = parseReqBody(req);
      const vehId = body.id || id;
      if (!vehId) return sendResponse(res, 400, false, 'ID Kendaraan wajib diisi.');

      const brand = (body.brand || '').trim();
      const model = (body.model || '').trim();
      const year = body.year ? parseInt(body.year) : null;
      const color = (body.color || '').trim();
      const customerName = (body.customer_name || '').trim();
      const customerPhone = (body.customer_phone || '').trim();

      const getVeh = await supabaseFetch(`vehicles?id=eq.${vehId}&select=*&limit=1`);
      if (!getVeh.ok || !getVeh.data || getVeh.data.length === 0) {
        return sendResponse(res, 404, false, 'Data kendaraan tidak ditemukan.');
      }

      const veh = getVeh.data[0];

      // Update customer if provided
      if (customerName && veh.customer_id) {
        await supabaseFetch(`customers?id=eq.${veh.customer_id}`, {
          method: 'PATCH',
          body: { name: customerName, phone: customerPhone || null }
        });
      }

      // Update vehicle
      const updVeh = await supabaseFetch(`vehicles?id=eq.${vehId}`, {
        method: 'PATCH',
        body: { brand, model, year, color }
      });

      if (!updVeh.ok) {
        return sendResponse(res, updVeh.status, false, 'Gagal memperbarui kendaraan.');
      }

      return sendResponse(res, 200, true, 'Data kendaraan berhasil diperbarui.');
    } catch (err) {
      return sendResponse(res, 500, false, 'Server Error: ' + err.message);
    }
  }

  if (method === 'DELETE') {
    try {
      const vehId = req.query.id || (parseReqBody(req).id);
      if (!vehId) return sendResponse(res, 400, false, 'ID Kendaraan wajib diisi.');

      const del = await supabaseFetch(`vehicles?id=eq.${vehId}`, { method: 'DELETE' });
      if (!del.ok) return sendResponse(res, del.status, false, 'Gagal menghapus kendaraan.');

      return sendResponse(res, 200, true, 'Data kendaraan berhasil dihapus.');
    } catch (err) {
      return sendResponse(res, 500, false, 'Server Error: ' + err.message);
    }
  }

  return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
};
