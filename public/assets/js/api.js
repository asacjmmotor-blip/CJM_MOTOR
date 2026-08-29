/**
 * Central Fetch API Client
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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Terjadi kesalahan pada server.');
    }
    return result;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}
