const { supabaseFetch, parseReqBody, sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendResponse(res, 200, true, 'OK');
  }
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return sendResponse(res, 405, false, 'Metode request tidak diizinkan.');
  }

  try {
    const body = parseReqBody(req);
    const id = req.query.id || (body ? (body.id || body.service_id) : null);

    if (!id) {
      return sendResponse(res, 400, false, 'ID Service wajib diisi.');
    }

    const del = await supabaseFetch(`services?id=eq.${id}`, { method: 'DELETE' });
    if (!del.ok) {
      return sendResponse(res, del.status, false, 'Gagal menghapus data service: ' + (del.data ? del.data.message : ''));
    }

    return sendResponse(res, 200, true, 'Data service berhasil dihapus!');
  } catch (err) {
    return sendResponse(res, 500, false, 'Server Error: ' + err.message);
  }
};
