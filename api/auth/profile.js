const { parseReqBody, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  const method = req.method;

  if (method === 'GET') {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const dateStr = `${String(now.getDate()).padStart(2, '0')} ${monthNames[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return sendResponse(res, 200, true, 'Data profil admin.', {
      id: 1,
      username: 'admin',
      name: 'Admin Bengkel',
      last_login: dateStr,
      workshop_name: 'CJM Motor',
      workshop_phone: '0812-3456-7890',
      workshop_address: 'Jl. Contoh No. 123 Jakarta',
      workshop_open_time: '08:00',
      workshop_close_time: '20:00',
      workshop_operating_days: 'Senin - Sabtu'
    });
  }

  if (method === 'POST' || method === 'PUT') {
    try {
      const body = parseReqBody(req);
      const action = body.action || 'change_password';

      if (action === 'update_workshop_info') {
        const workshopName = (body.workshop_name || '').trim();
        const workshopPhone = (body.workshop_phone || '').trim();
        const workshopAddress = (body.workshop_address || '').trim();
        const workshopOpenTime = (body.workshop_open_time || '08:00').trim();
        const workshopCloseTime = (body.workshop_close_time || '20:00').trim();
        const workshopOperatingDays = (body.workshop_operating_days || 'Senin - Sabtu').trim();

        if (!workshopName) {
          return sendResponse(res, 400, false, 'Nama bengkel wajib diisi.');
        }

        return sendResponse(res, 200, true, 'Informasi bengkel berhasil diperbarui!', {
          workshop_name: workshopName,
          workshop_phone: workshopPhone,
          workshop_address: workshopAddress,
          workshop_open_time: workshopOpenTime,
          workshop_close_time: workshopCloseTime,
          workshop_operating_days: workshopOperatingDays
        });
      }

      if (action === 'change_password') {
        const currentPassword = (body.current_password || '').trim();
        const newPassword = (body.new_password || '').trim();
        const confirmPassword = (body.confirm_password || '').trim();

        if (!currentPassword || !newPassword) {
          return sendResponse(res, 400, false, 'Password saat ini dan password baru wajib diisi.');
        }

        if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
          return sendResponse(res, 400, false, 'Password baru harus minimal 8 karakter, serta mengandung huruf dan angka.');
        }

        if (newPassword !== confirmPassword) {
          return sendResponse(res, 400, false, 'Konfirmasi password baru tidak cocok.');
        }

        return sendResponse(res, 200, true, 'Password admin berhasil diperbarui.');
      }
    } catch (err) {
      return sendResponse(res, 500, false, 'Server Error: ' + err.message);
    }
  }

  return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
};
