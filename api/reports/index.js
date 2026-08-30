const { supabaseFetch, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
  }

  try {
    const period = req.query.period || 'bulan_ini';

    // Fetch all services with vehicle & customer & item details
    const { ok, status, data } = await supabaseFetch('services?select=*,vehicles(*,customers(*)),service_items(*)&order=created_at.desc');
    if (!ok) {
      return sendResponse(res, status, false, 'Gagal memuat laporan.');
    }

    const services = data || [];
    let totalRevenue = 0;
    let totalServices = services.length;
    let pendingCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    services.forEach(s => {
      const items = s.service_items || [];
      const cost = items.length > 0
        ? items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0)
        : (parseFloat(s.total_cost) || 0);

      totalRevenue += cost;

      if (s.status === 'Menunggu') pendingCount++;
      else if (s.status === 'Proses') inProgressCount++;
      else if (s.status === 'Selesai' || s.status === 'Diambil') completedCount++;
    });

    const reportData = {
      summary: {
        total_revenue: totalRevenue,
        total_services: totalServices,
        pending_services: pendingCount,
        in_progress_services: inProgressCount,
        completed_services: completedCount
      },
      services: services.map(s => {
        const v = s.vehicles || {};
        const c = v.customers || {};
        const items = s.service_items || [];
        const cost = items.length > 0
          ? items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0)
          : (parseFloat(s.total_cost) || 0);

        return {
          id: s.id,
          service_code: s.service_code,
          service_date: s.service_date,
          service_type: s.service_type,
          mechanic: s.mechanic || '-',
          status: s.status,
          total_cost: cost,
          plate_number: v.plate_number || '-',
          brand: v.brand || '-',
          model: v.model || '-',
          customer_name: c.name || 'Umum / Non-Member'
        };
      })
    };

    return sendResponse(res, 200, true, 'Data laporan berhasil dimuat.', reportData);
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
