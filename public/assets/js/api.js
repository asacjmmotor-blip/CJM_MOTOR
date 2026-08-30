/**
 * Central Fetch API Client (Supports Vercel Serverless & PHP Endpoints)
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

const API_BASE = '/api';

async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {}
  };

  if (data) {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  // Generate fallback endpoint without .php extension for Vercel Node.js Serverless functions
  const jsEndpoint = endpoint.replace(/\.php$/, '.js').replace(/\.php(\?.*)?$/, '$1');

  try {
    let response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // If .php endpoint returned 404 or 500 error on Vercel, fallback to .js serverless endpoint
    if (!response.ok && endpoint.endsWith('.php')) {
      try {
        const altResponse = await fetch(`${API_BASE}${jsEndpoint}`, options);
        if (altResponse.ok) {
          response = altResponse;
        }
      } catch (e) {}
    }

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error(`Respons Server (HTTP ${response.status}): ${text.substring(0, 150)}`);
    }

    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status} Error`);
    }
    return result;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}
