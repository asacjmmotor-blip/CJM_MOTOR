const { supabaseFetch, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
  }

  try {
    const period = req.query.period || 'bulanan';

    // 1. Fetch count stats
    const custFetch = await supabaseFetch('customers?select=id');
    const vehFetch = await supabaseFetch('vehicles?select=id');

    const totalCustomers = (custFetch.ok && Array.isArray(custFetch.data)) ? custFetch.data.length : 0;
    const totalVehicles = (vehFetch.ok && Array.isArray(vehFetch.data)) ? vehFetch.data.length : 0;

    // 2. Fetch all services with vehicle, customer, and item details
    const { ok, status, data } = await supabaseFetch('services?select=*,vehicles(*,customers(*)),service_items(*)&order=created_at.desc');
    if (!ok) {
      return sendResponse(res, status, false, 'Gagal memuat laporan.');
    }

    const allServices = data || [];
    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();

    let todayCount = 0;
    let activeCount = 0;
    let completedCount = 0;

    allServices.forEach(s => {
      if (s.service_date === todayStr) todayCount++;
      if (s.status === 'Menunggu' || s.status === 'Proses') activeCount++;
      if (s.status === 'Selesai' || s.status === 'Diambil') completedCount++;
    });

    // 3. Filter services by period
    const filteredServices = allServices.filter(s => {
      if (period === 'semua') return true;

      const sDate = s.service_date ? new Date(s.service_date) : new Date(s.created_at);
      if (isNaN(sDate.getTime())) return true;

      if (period === 'mingguan') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return sDate >= sevenDaysAgo;
      } else if (period === 'bulanan') {
        return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
      } else if (period === 'bulan_lalu') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return sDate.getMonth() === lastMonth.getMonth() && sDate.getFullYear() === lastMonth.getFullYear();
      }

      return true;
    });

    let periodRevenue = 0;
    const reportItems = filteredServices.map(s => {
      const v = s.vehicles || {};
      const c = v.customers || {};
      const items = s.service_items || [];
      const cost = items.length > 0
        ? items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0)
        : (parseFloat(s.total_cost) || 0);

      periodRevenue += cost;

      return {
        id: s.id,
        service_code: s.service_code,
        service_date: s.service_date || s.created_at.slice(0, 10),
        service_type: s.service_type,
        mechanic: s.mechanic || '-',
        status: s.status,
        total_cost: cost,
        plate_number: v.plate_number || '-',
        brand: v.brand || '-',
        model: v.model || '-',
        customer_name: c.name || 'Umum / Non-Member',
        customer_phone: c.phone || '-'
      };
    });

    const recentServices = allServices.slice(0, 5).map(s => {
      const v = s.vehicles || {};
      const c = v.customers || {};
      return {
        id: s.id,
        service_code: s.service_code,
        service_date: s.service_date || s.created_at.slice(0, 10),
        service_type: s.service_type,
        status: s.status,
        plate_number: v.plate_number || '-',
        brand: v.brand || '-',
        model: v.model || '-',
        customer_name: c.name || 'Umum'
      };
    });

    return sendResponse(res, 200, true, 'Data laporan berhasil dimuat.', {
      total_customers: totalCustomers,
      total_vehicles: totalVehicles,
      today_services: todayCount,
      active_services: activeCount,
      completed_services: completedCount,
      period_revenue: periodRevenue,
      period: period,
      recent_services: recentServices,
      report_items: reportItems
    });
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
