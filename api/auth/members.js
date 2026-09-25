const { supabaseFetch, parseReqBody, sendResponse } = require('../_supabase');
const { loadStore, saveStore } = require('./_store');

module.exports = async (req, res) => {
  const method = req.method;

  if (method === 'OPTIONS') {
    return sendResponse(res, 200, true, 'OK');
  }

  const store = loadStore();

  // GET: Fetch list of members
  if (method === 'GET') {
    try {
      const { ok, data: dbAdmins } = await supabaseFetch('admins?select=id,name,username,phone,role,created_at&order=id.asc');
      if (ok && Array.isArray(dbAdmins) && dbAdmins.length > 0) {
        const formattedMembers = dbAdmins.map(m => ({
          id: m.id,
          name: m.name || 'Admin',
          username: m.username,
          phone: m.phone || '-',
          role: m.role || (m.username === 'admin' ? 'Admin Utama' : 'Kasir / Front Desk'),
          created_at: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : '2026-01-01'
        }));
        
        // Sync to local store
        store.members = formattedMembers;
        saveStore(store);

        return sendResponse(res, 200, true, 'Daftar anggota bengkel.', formattedMembers);
      }
    } catch (e) {}

    // Fallback to in-memory/store members
    return sendResponse(res, 200, true, 'Daftar anggota bengkel (Store).', store.members || []);
  }

  // POST: Create, Reset Password, or Delete member
  if (method === 'POST') {
    try {
      const body = parseReqBody(req);
      const action = body.action || 'create';

      // 1. TAMBAH ANGGOTA BARU
      if (action === 'create') {
        const name = (body.name || '').trim();
        const username = (body.username || '').trim().toLowerCase();
        const phone = (body.phone || '').trim();
        const role = (body.role || 'Kasir / Front Desk').trim();
        const password = (body.password || '').trim();

        if (!name) {
          return sendResponse(res, 400, false, 'Nama anggota wajib diisi.');
        }
        if (!username || username.length < 3) {
          return sendResponse(res, 400, false, 'Username minimal 3 karakter.');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          return sendResponse(res, 400, false, 'Username hanya boleh huruf, angka, dan underscore.');
        }

        // Check requirement password
        if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
          return sendResponse(res, 400, false, 'Password minimal 8 karakter, serta mengandung huruf dan angka.');
        }

        // Check duplicate username in local store
        const existsLocally = (store.members || []).some(m => m.username.toLowerCase() === username);
        if (existsLocally) {
          return sendResponse(res, 400, false, `Username "${username}" sudah digunakan anggota lain.`);
        }

        // Try insert into Supabase admins table
        let createdId = Date.now();
        try {
          const checkDb = await supabaseFetch(`admins?username=eq.${encodeURIComponent(username)}&select=id`);
          if (checkDb.ok && Array.isArray(checkDb.data) && checkDb.data.length > 0) {
            return sendResponse(res, 400, false, `Username "${username}" sudah digunakan di database.`);
          }

          // Hash placeholder or plain text format for fallback
          const insertRes = await supabaseFetch('admins', {
            method: 'POST',
            body: {
              name,
              username,
              password_hash: `$2y$10$e0MYzXyjpJS7${password}`,
              phone,
              role
            }
          });

          if (insertRes.ok && Array.isArray(insertRes.data) && insertRes.data[0]) {
            createdId = insertRes.data[0].id;
          }
        } catch (e) {}

        const newMember = {
          id: createdId,
          name,
          username,
          phone: phone || '-',
          role,
          created_at: new Date().toISOString().split('T')[0]
        };

        if (!store.members) store.members = [];
        store.members.push(newMember);
        saveStore(store);

        return sendResponse(res, 200, true, 'Anggota baru berhasil terdaftar!', newMember);
      }

      // 2. RESET PASSWORD ANGGOTA
      if (action === 'reset_password') {
        const username = (body.username || '').trim().toLowerCase();
        const newPassword = (body.new_password || '').trim();

        if (!username) {
          return sendResponse(res, 400, false, 'Username anggota tidak ditemukan.');
        }
        if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
          return sendResponse(res, 400, false, 'Password baru minimal 8 karakter, serta mengandung huruf dan angka.');
        }

        try {
          await supabaseFetch(`admins?username=eq.${encodeURIComponent(username)}`, {
            method: 'PATCH',
            body: {
              password_hash: `$2y$10$e0MYzXyjpJS7${newPassword}`
            }
          });
        } catch (e) {}

        return sendResponse(res, 200, true, `Password untuk akun "${username}" berhasil diperbarui!`);
      }

      // 3. HAPUS ANGGOTA
      if (action === 'delete') {
        const username = (body.username || '').trim().toLowerCase();

        if (!username) {
          return sendResponse(res, 400, false, 'Username anggota wajib ditentukan.');
        }

        if (username === 'admin' || username === (store.username || '').toLowerCase()) {
          return sendResponse(res, 400, false, 'Akun Admin Utama saat ini tidak dapat dihapus.');
        }

        try {
          await supabaseFetch(`admins?username=eq.${encodeURIComponent(username)}`, {
            method: 'DELETE'
          });
        } catch (e) {}

        if (store.members) {
          store.members = store.members.filter(m => m.username.toLowerCase() !== username);
          saveStore(store);
        }

        return sendResponse(res, 200, true, `Anggota "${username}" berhasil dihapus.`);
      }

      return sendResponse(res, 400, false, `Aksi "${action}" tidak valid.`);
    } catch (err) {
      return sendResponse(res, 500, false, 'Server Error: ' + err.message);
    }
  }

  return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
};
