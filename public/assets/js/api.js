/**
 * Central Fetch API Client (Optimized for Vercel Serverless Functions)
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

  // Strip .php extension so endpoints cleanly hit Vercel Serverless Functions (/api/auth/login.js)
  const cleanEndpoint = endpoint.replace(/\.php$/, '').replace(/\.php(\?.*)?$/, '$1');

  try {
    // Try clean endpoint first (/api/auth/login)
    let response = await fetch(`${API_BASE}${cleanEndpoint}`, options);
    
    // If clean endpoint failed with 404/403, try original endpoint path as fallback
    if (!response.ok && endpoint !== cleanEndpoint) {
      try {
        const origResponse = await fetch(`${API_BASE}${endpoint}`, options);
        if (origResponse.ok) {
          response = origResponse;
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
