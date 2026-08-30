/**
 * Helper for Supabase REST API calls in Vercel Serverless Functions
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dkloscesxkmdbwmmxzte.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

async function supabaseFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...(options.headers || {})
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };

  const response = await fetch(url, config);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  return { ok: response.ok, status: response.status, data };
}

function parseReqBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }
  return body || {};
}

function sendResponse(res, statusCode, success, message, data = null) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(statusCode).json({
    success,
    message,
    ...(data !== null ? (Array.isArray(data) ? { data } : (data.data ? data : { data })) : {})
  });
}

module.exports = {
  SUPABASE_URL,
  SUPABASE_KEY,
  supabaseFetch,
  parseReqBody,
  sendResponse
};
