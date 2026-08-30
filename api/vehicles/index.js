const { supabaseFetch, parseReqBody, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  const method = req.method;

  if (method === 'GET') {
    try {
      const q = req.query.q || '';
      let endpoint = 'vehicles?select=*,customers(*)&order=created_at.desc';
      if (q) {
        endpoint += `&or=(plate_number.ilike.*${encodeURIComponent(q)}*,brand.ilike.*${encodeURIComponent(q)}*,model.ilike.*${encodeURIComponent(q)}*)`;
      }

      const { ok, status, data } = await supabaseFetch(endpoint);
      if (!ok) {
        return sendResponse(res, status, false, 'Gagal mengambil data kendaraan: ' + (data ? data.message : ''));
      }

      const formatted = (data || []).map(v => ({
        id: v.id,
        plate_number: v.plate_number,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        photo_url: v.photo_url,
        customer_id: v.customer_id,
        customer_name: v.customers ? v.customers.name : 'Umum / Non-Member',
        customer_phone: v.customers ? v.customers.phone : '-',
        created_at: v.created_at
      }));

      return sendResponse(res, 200, true, 'Data kendaraan berhasil dimuat.', formatted);
    } catch (err) {
      return sendResponse(res, 500, false, 'Server Error: ' + err.message);
    }
  }

  if (method === 'POST') {
    try {
      const body = parseReqBody(req);
      const rawPlate = (body.plate_number || '').trim();
      const brand = (body.brand || '').trim();
      const model = (body.model || '').trim();
      const year = body.year ? parseInt(body.year) : null;
      const color = (body.color || '').trim();
      const customerName = (body.customer_name || '').trim();
      const customerPhone = (body.customer_phone || '').trim();

      if (!rawPlate || !brand || !model) {
        return sendResponse(res, 400, false, 'Nomor Polisi, Merek, dan Model kendaraan wajib diisi.');
      }

      const plateNumber = rawPlate.toUpperCase().replace(/\s+/g, ' ');
      const cleanPlate = plateNumber.replace(/\s+/g, '');

      // 1. Check if vehicle plate already exists
      const checkVeh = await supabaseFetch(`vehicles?select=*`);
      if (checkVeh.ok && Array.isArray(checkVeh.data)) {
        const existing = checkVeh.data.find(v => v.plate_number.replace(/\s+/g, '').toUpperCase() === cleanPlate);
        if (existing) {
          return sendResponse(res, 400, false, `Nomor polisi ${plateNumber} sudah terdaftar di sistem!`, existing);
        }
      }

      // 2. Resolve Customer ID
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

      // 3. Create Vehicle
      const newVeh = await supabaseFetch('vehicles', {
        method: 'POST',
        body: {
          customer_id: customerId,
          plate_number: plateNumber,
          brand,
          model,
          year,
          color
        }
      });

      let vehicle = null;
      if (newVeh.ok && newVeh.data) {
        if (Array.isArray(newVeh.data) && newVeh.data.length > 0) vehicle = newVeh.data[0];
        else if (newVeh.data.id) vehicle = newVeh.data;
      }

      if (!vehicle) {
        const findCreated = await supabaseFetch(`vehicles?select=*&plate_number=eq.${encodeURIComponent(plateNumber)}&limit=1`);
        if (findCreated.ok && Array.isArray(findCreated.data) && findCreated.data.length > 0) {
          vehicle = findCreated.data[0];
        }
      }

      if (!vehicle) {
        return sendResponse(res, 500, false, 'Gagal menambah kendaraan.');
      }

      return sendResponse(res, 201, true, 'Kendaraan berhasil ditambahkan!', vehicle);
    } catch (err) {
      return sendResponse(res, 500, false, 'Server Error: ' + err.message);
    }
  }

  return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
};
