const { supabaseFetch, parseReqBody, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
  }

  try {
    const body = parseReqBody(req);
    const serviceId = body.id || body.service_id;
    if (!serviceId) {
      return sendResponse(res, 400, false, 'ID Service wajib diisi.');
    }

    // 1. Fetch current service to get vehicle_id & customer_id
    const curSvc = await supabaseFetch(`services?id=eq.${serviceId}&select=*,vehicles(*)&limit=1`);
    if (!curSvc.ok || !curSvc.data || curSvc.data.length === 0) {
      return sendResponse(res, 404, false, 'Data service tidak ditemukan.');
    }

    const currentSvc = curSvc.data[0];
    const vehicle = currentSvc.vehicles || {};
    const vehicleId = currentSvc.vehicle_id;
    const customerId = vehicle.customer_id;

    // 2. Prepare updates for services table
    const serviceUpdate = {};
    if (body.status !== undefined) serviceUpdate.status = body.status;
    if (body.service_type !== undefined) serviceUpdate.service_type = body.service_type;
    if (body.mechanic !== undefined) serviceUpdate.mechanic = body.mechanic;
    if (body.complaint !== undefined) serviceUpdate.complaint = body.complaint;
    if (body.notes !== undefined) serviceUpdate.notes = body.notes;
    if (body.attachment_url !== undefined) serviceUpdate.attachment_url = body.attachment_url;

    // Items update & total_cost recalculation
    const items = Array.isArray(body.items) ? body.items : null;
    if (items !== null) {
      let totalCost = 0;
      items.forEach(it => {
        const qty = parseInt(it.quantity) || 1;
        const price = parseFloat(it.price) || 0;
        totalCost += qty * price;
      });
      serviceUpdate.total_cost = totalCost;

      // Delete old items and insert new ones
      await supabaseFetch(`service_items?service_id=eq.${serviceId}`, { method: 'DELETE' });

      if (items.length > 0) {
        const itemPayloads = items.map(it => {
          const qty = parseInt(it.quantity) || 1;
          const price = parseFloat(it.price) || 0;
          return {
            service_id: serviceId,
            item_name: it.item_name || 'Jasa Service',
            item_type: it.item_type || 'Jasa',
            quantity: qty,
            price,
            subtotal: qty * price
          };
        });

        await supabaseFetch('service_items', {
          method: 'POST',
          body: itemPayloads
        });
      }
    }

    if (Object.keys(serviceUpdate).length > 0) {
      const updateSvc = await supabaseFetch(`services?id=eq.${serviceId}`, {
        method: 'PATCH',
        body: serviceUpdate
      });
      if (!updateSvc.ok) {
        return sendResponse(res, updateSvc.status, false, 'Gagal memperbarui data service: ' + (updateSvc.data ? updateSvc.data.message : ''));
      }
    }

    // 3. Update Vehicle info if provided
    const vehicleUpdate = {};
    if (body.brand !== undefined) vehicleUpdate.brand = body.brand;
    if (body.model !== undefined) vehicleUpdate.model = body.model;
    if (body.year !== undefined) vehicleUpdate.year = body.year ? parseInt(body.year) : null;
    if (body.color !== undefined) vehicleUpdate.color = body.color;

    if (vehicleId && Object.keys(vehicleUpdate).length > 0) {
      const updateVeh = await supabaseFetch(`vehicles?id=eq.${vehicleId}`, {
        method: 'PATCH',
        body: vehicleUpdate
      });
      if (!updateVeh.ok) {
        return sendResponse(res, updateVeh.status, false, 'Gagal memperbarui data kendaraan: ' + (updateVeh.data ? updateVeh.data.message : ''));
      }
    }

    // 4. Update Customer info if provided
    const customerUpdate = {};
    if (body.customer_name !== undefined) customerUpdate.name = body.customer_name;
    if (body.customer_phone !== undefined) customerUpdate.phone = body.customer_phone;

    if (customerId && Object.keys(customerUpdate).length > 0) {
      const updateCust = await supabaseFetch(`customers?id=eq.${customerId}`, {
        method: 'PATCH',
        body: customerUpdate
      });
      if (!updateCust.ok) {
        return sendResponse(res, updateCust.status, false, 'Gagal memperbarui data customer: ' + (updateCust.data ? updateCust.data.message : ''));
      }
    }

    return sendResponse(res, 200, true, 'Data Service, Kendaraan, dan Customer berhasil diperbarui!');
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
