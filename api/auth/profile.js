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
      last_login: dateStr
    });
  }

  if (method === 'POST' || method === 'PUT') {
    try {
      const body = parseReqBody(req);
      const action = body.action || 'change_password';

      if (action === 'update_workshop_info') {
        const workshopName = (body.workshop_name || '').trim();
        const workshopPhone = (body.workshop_phone || '').trim();

        if (!workshopName) {
          return sendResponse(res, 400, false, 'Nama bengkel wajib diisi.');
        }

        return sendResponse(res, 200, true, 'Informasi bengkel berhasil diperbarui!', {
          workshop_name: workshopName,
          workshop_phone: workshopPhone
        });
      }

      if (action === 'change_password') {
        const currentPassword = (body.current_password || '').trim();
        const newPassword = (body.new_password || '').trim();
        const confirmPassword = (body.confirm_password || '').trim();

        if (!currentPassword || !newPassword) {
          return sendResponse(res, 400, false, 'Password saat ini dan password baru wajib diisi.');
        }

        if (newPassword.length < 6) {
          return sendResponse(res, 400, false, 'Password baru minimal 6 karakter.');
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
