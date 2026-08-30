module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
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
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    return res.status(500).json({ success: false, message: 'Koneksi Supabase belum terkonfigurasi. Kunci SUPABASE_ANON_KEY belum di-set di Vercel.' });
  }

  try {
    const url = `${supabaseUrl}/rest/v1/admins?username=eq.${encodeURIComponent(username)}&select=*`;
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: data.message || 'Gagal terhubung ke database Supabase.' });
    }

    if (!data || data.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const admin = data[0];
    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        admin: { id: admin.id, name: admin.name, username: admin.username }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + err.message });
  }
};
