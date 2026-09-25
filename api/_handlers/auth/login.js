const { loadStore, saveStore, getFormattedDateTime } = require('./_store');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true, message: 'OK' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Metode request tidak diizinkan.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }
  body = body || {};

  const username = (body.username || '').trim();
  const password = (body.password || '').trim();

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://dkloscesxkmdbwmmxzte.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  const loginTime = getFormattedDateTime();

  const recordSuccessfulLogin = (adminObj = {}) => {
    const store = loadStore();
    store.last_login = loginTime;
    if (adminObj.name) store.name = adminObj.name;
    if (adminObj.username) store.username = adminObj.username;
    saveStore(store);
    return {
      id: adminObj.id || store.id || 1,
      name: adminObj.name || store.name || 'Admin Bengkel',
      username: adminObj.username || store.username || 'admin',
      last_login: loginTime
    };
  };

  if (!supabaseKey) {
    if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
      const adminData = recordSuccessfulLogin();
      return res.status(200).json({
        success: true,
        message: 'Login berhasil.',
        data: { admin: adminData, last_login: loginTime }
      });
    }
    return res.status(500).json({ success: false, message: 'Koneksi Supabase belum terkonfigurasi di Vercel.' });
  }

  try {
    const url = `${supabaseUrl}/rest/v1/admins?username=eq.${encodeURIComponent(username)}&select=*`;
    let response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const data = await response.json();
    
    // If Supabase returned 403 Forbidden due to RLS, allow default admin login fallback if credentials match default admin
    if (!response.ok) {
      if (response.status === 403) {
        if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
          const adminData = recordSuccessfulLogin();
          return res.status(200).json({
            success: true,
            message: 'Login berhasil (Default Admin).',
            data: { admin: adminData, last_login: loginTime }
          });
        }
        return res.status(403).json({
          success: false,
          message: 'Supabase RLS Aktif (HTTP 403). Jalankan "ALTER TABLE admins DISABLE ROW LEVEL SECURITY;" di Supabase SQL Editor.'
        });
      }
      return res.status(response.status).json({ success: false, message: data.message || 'Gagal terhubung ke Supabase.' });
    }

    if (!data || data.length === 0) {
      // Fallback check for default admin
      if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
        const adminData = recordSuccessfulLogin();
        return res.status(200).json({
          success: true,
          message: 'Login berhasil.',
          data: { admin: adminData, last_login: loginTime }
        });
      }
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const admin = data[0];
    const adminData = recordSuccessfulLogin(admin);
    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        admin: adminData,
        last_login: loginTime
      }
    });
  } catch (err) {
    // Graceful fallback for network / server error
    if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
      const adminData = recordSuccessfulLogin();
      return res.status(200).json({
        success: true,
        message: 'Login berhasil.',
        data: { admin: adminData, last_login: loginTime }
      });
    }
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + err.message });
  }
};

