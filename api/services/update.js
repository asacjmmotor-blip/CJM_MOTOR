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

    const status = body.status;
    const mechanic = body.mechanic;
    const complaint = body.complaint;
    const notes = body.notes;
    const items = Array.isArray(body.items) ? body.items : null;

    const updatePayload = {};
    if (status !== undefined) updatePayload.status = status;
    if (mechanic !== undefined) updatePayload.mechanic = mechanic;
    if (complaint !== undefined) updatePayload.complaint = complaint;
    if (notes !== undefined) updatePayload.notes = notes;

    if (items !== null) {
      let totalCost = 0;
      items.forEach(it => {
        const qty = parseInt(it.quantity) || 1;
        const price = parseFloat(it.price) || 0;
        totalCost += qty * price;
      });
      updatePayload.total_cost = totalCost;

      // Delete existing service items and re-insert
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

    if (Object.keys(updatePayload).length > 0) {
      const upd = await supabaseFetch(`services?id=eq.${serviceId}`, {
        method: 'PATCH',
        body: updatePayload
      });

      if (!upd.ok) {
        return sendResponse(res, upd.status, false, 'Gagal menginstal pembaruan status service.');
      }
    }

    return sendResponse(res, 200, true, 'Status & Rincian Service berhasil diperbarui!');
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
