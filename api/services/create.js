const { supabaseFetch, parseReqBody, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
  }

  try {
    const body = parseReqBody(req);
    const rawPlate = (body.plate_number || '').trim();
    const brand = (body.brand || '').trim();
    const model = (body.model || '').trim();
    const year = body.year ? parseInt(body.year) : null;
    const customerName = (body.customer_name || '').trim();
    const customerPhone = (body.customer_phone || '').trim();
    const serviceType = (body.service_type || 'Service Rutin').trim();
    const complaint = (body.complaint || '').trim();
    const mechanic = (body.mechanic || '-').trim();
    const notes = (body.notes || '').trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!rawPlate) {
      return sendResponse(res, 400, false, 'Nomor Polisi kendaraan wajib diisi.');
    }

    const plateNumber = rawPlate.toUpperCase().replace(/\s+/g, ' ');
    const cleanPlate = plateNumber.replace(/\s+/g, '');

    // 1. Resolve Vehicle
    let vehicleId = null;
    const checkVeh = await supabaseFetch('vehicles?select=*');
    if (checkVeh.ok && Array.isArray(checkVeh.data)) {
      const existing = checkVeh.data.find(v => v.plate_number.replace(/\s+/g, '').toUpperCase() === cleanPlate);
      if (existing) {
        vehicleId = existing.id;
      }
    }

    if (!vehicleId) {
      if (!brand || !model) {
        return sendResponse(res, 400, false, 'Merek & Model kendaraan wajib diisi untuk registrasi kendaraan baru.');
      }

      // Resolve Customer ID
      let customerId = null;
      if (customerName) {
        const custSearch = await supabaseFetch(`customers?name=ilike.*${encodeURIComponent(customerName)}*&limit=1`);
        if (custSearch.ok && Array.isArray(custSearch.data) && custSearch.data.length > 0) {
          customerId = custSearch.data[0].id;
        } else {
          const newCust = await supabaseFetch('customers', {
            method: 'POST',
            body: { name: customerName, phone: customerPhone || null }
          });
          if (newCust.ok && newCust.data) {
            if (Array.isArray(newCust.data) && newCust.data.length > 0) customerId = newCust.data[0].id;
            else if (newCust.data.id) customerId = newCust.data.id;
          }
        }
      }

      if (!customerId) {
        const defCust = await supabaseFetch(`customers?name=eq.${encodeURIComponent('Umum / Non-Member')}&limit=1`);
        if (defCust.ok && Array.isArray(defCust.data) && defCust.data.length > 0) {
          customerId = defCust.data[0].id;
        } else {
          const createDef = await supabaseFetch('customers', {
            method: 'POST',
            body: { name: 'Umum / Non-Member', phone: '-' }
          });
          if (createDef.ok && createDef.data) {
            if (Array.isArray(createDef.data) && createDef.data.length > 0) customerId = createDef.data[0].id;
            else if (createDef.data.id) customerId = createDef.data.id;
          }
        }
      }

      // Create new Vehicle
      const createVeh = await supabaseFetch('vehicles', {
        method: 'POST',
        body: { customer_id: customerId, plate_number: plateNumber, brand, model, year }
      });

      if (createVeh.ok && createVeh.data) {
        if (Array.isArray(createVeh.data) && createVeh.data.length > 0) vehicleId = createVeh.data[0].id;
        else if (createVeh.data.id) vehicleId = createVeh.data.id;
      }

      // Fallback lookup if vehicle ID was not returned directly in payload
      if (!vehicleId) {
        const findCreated = await supabaseFetch(`vehicles?select=id&plate_number=eq.${encodeURIComponent(plateNumber)}&limit=1`);
        if (findCreated.ok && Array.isArray(findCreated.data) && findCreated.data.length > 0) {
          vehicleId = findCreated.data[0].id;
        }
      }
    }

    if (!vehicleId) {
      return sendResponse(res, 500, false, 'Gagal meregistrasi kendaraan.');
    }

    // 2. Generate Unique Service Code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const serviceCode = `SVC-${dateStr}-${randCode}`;

    // Calculate total cost
    let totalCost = 0;
    items.forEach(it => {
      const qty = parseInt(it.quantity) || 1;
      const price = parseFloat(it.price) || 0;
      totalCost += qty * price;
    });

    // 3. Create Service Entry
    const createSvc = await supabaseFetch('services', {
      method: 'POST',
      body: {
        vehicle_id: vehicleId,
        service_code: serviceCode,
        service_date: new Date().toISOString().slice(0, 10),
        service_type: serviceType,
        complaint,
        mechanic,
        status: 'Menunggu',
        notes,
        total_cost: totalCost
      }
    });

    if (!createSvc.ok) {
      return sendResponse(res, createSvc.status, false, 'Gagal membuat service baru: ' + (createSvc.data.message || ''));
    }

    let service = Array.isArray(createSvc.data) ? createSvc.data[0] : createSvc.data;
    let serviceId = service ? service.id : null;

    if (!serviceId) {
      const findSvc = await supabaseFetch(`services?select=id&service_code=eq.${encodeURIComponent(serviceCode)}&limit=1`);
      if (findSvc.ok && Array.isArray(findSvc.data) && findSvc.data.length > 0) {
        serviceId = findSvc.data[0].id;
      }
    }

    // 4. Create Service Items
    if (serviceId && items.length > 0) {
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

    return sendResponse(res, 201, true, 'Service baru berhasil didaftarkan!', {
      id: serviceId,
      service_code: serviceCode,
      vehicle_id: vehicleId,
      status: 'Menunggu'
    });
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
