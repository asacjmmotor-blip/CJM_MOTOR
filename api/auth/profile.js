const { parseReqBody, sendResponse } = require('../_supabase');
const { loadStore, saveStore, getFormattedDateTime } = require('./_store');

module.exports = async (req, res) => {
  const method = req.method;

  if (method === 'OPTIONS') {
    return sendResponse(res, 200, true, 'OK');
  }

  const store = loadStore();

  if (method === 'GET') {
    if (!store.last_login) {
      store.last_login = getFormattedDateTime();
      saveStore(store);
    }

    return sendResponse(res, 200, true, 'Data profil admin.', {
      id: store.id || 1,
      username: store.username || 'admin',
      name: store.name || 'Admin Bengkel',
      phone: store.phone || '',
      last_login: store.last_login,
      workshop_name: store.workshop_name || 'CJM Motor',
      workshop_phone: store.workshop_phone || '0812-3456-7890',
      workshop_address: store.workshop_address || 'Jl. Contoh No. 123 Jakarta',
      workshop_open_time: store.workshop_open_time || '08:00',
      workshop_close_time: store.workshop_close_time || '20:00',
      workshop_operating_days: store.workshop_operating_days || 'Senin - Sabtu'
    });
  }

  if (method === 'POST' || method === 'PUT') {
    try {
      const body = parseReqBody(req);
      const action = body.action || 'change_password';

      if (action === 'update_admin_info') {
        const name = (body.name || '').trim();
        const phone = (body.phone || '').trim();

        if (!name) {
          return sendResponse(res, 400, false, 'Nama admin wajib diisi.');
        }

        store.name = name;
        store.phone = phone;
        saveStore(store);

        return sendResponse(res, 200, true, 'Data admin berhasil diperbarui!', {
          name: store.name,
          phone: store.phone
        });
      }

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

        store.workshop_name = workshopName;
        store.workshop_phone = workshopPhone;
        store.workshop_address = workshopAddress;
        store.workshop_open_time = workshopOpenTime;
        store.workshop_close_time = workshopCloseTime;
        store.workshop_operating_days = workshopOperatingDays;
        saveStore(store);

        return sendResponse(res, 200, true, 'Informasi bengkel berhasil diperbarui!', {
          workshop_name: store.workshop_name,
          workshop_phone: store.workshop_phone,
          workshop_address: store.workshop_address,
          workshop_open_time: store.workshop_open_time,
          workshop_close_time: store.workshop_close_time,
          workshop_operating_days: store.workshop_operating_days
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

      return sendResponse(res, 400, false, `Aksi "${action}" tidak valid.`);
    } catch (err) {
      return sendResponse(res, 500, false, 'Server Error: ' + err.message);
    }
  }

  return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
};
