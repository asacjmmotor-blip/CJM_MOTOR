/**
 * Central Fetch API Client with High-Performance Memory & Storage Caching
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

const API_BASE = '/api';
const API_CACHE = new Map(); // Fast In-Memory Cache
const CACHE_TTL_MS = 60 * 1000; // 60 Seconds Cache TTL

/**
 * Clear API cache (flushes memory & sessionStorage cache)
 */
function clearApiCache(pathPrefix = '') {
  if (!pathPrefix) {
    API_CACHE.clear();
    try {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('cjm_cache_')) sessionStorage.removeItem(k);
      });
    } catch (e) {}
    return;
  }

  for (const key of API_CACHE.keys()) {
    if (key.includes(pathPrefix)) API_CACHE.delete(key);
  }

  try {
    Object.keys(sessionStorage).forEach(k => {
      if (k.startsWith('cjm_cache_') && k.includes(pathPrefix)) {
        sessionStorage.removeItem(k);
      }
    });
  } catch (e) {}
}

async function apiRequest(endpoint, method = 'GET', data = null, options = {}) {
  const upperMethod = method.toUpperCase();
  const cleanEndpoint = endpoint.replace(/\.php$/, '').replace(/\.php(\?.*)?$/, '$1');
  const cacheKey = `cjm_cache_${cleanEndpoint}`;

  // If mutating data (POST, PUT, DELETE), automatically invalidate all GET caches
  if (upperMethod !== 'GET') {
    clearApiCache();
  }

  // Check cache for GET requests
  const useCache = upperMethod === 'GET' && options.useCache !== false;
  if (useCache) {
    // 1. Memory Cache lookup (0ms instant response)
    const memCache = API_CACHE.get(cacheKey);
    if (memCache && (Date.now() - memCache.timestamp < CACHE_TTL_MS)) {
      return memCache.data;
    }

    // 2. SessionStorage Cache lookup
    try {
      const stored = sessionStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          API_CACHE.set(cacheKey, parsed);
          return parsed.data;
        }
      }
    } catch (e) {}
  }

  const fetchOptions = {
    method: upperMethod,
    headers: {}
  };

  if (data) {
    if (data instanceof FormData) {
      fetchOptions.body = data;
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(data);
    }
  }

  try {
    let response = await fetch(`${API_BASE}${cleanEndpoint}`, fetchOptions);
    
    // Fallback if endpoint with .php was requested
    if (!response.ok && endpoint !== cleanEndpoint) {
      try {
        const origResponse = await fetch(`${API_BASE}${endpoint}`, fetchOptions);
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

    // Cache successful GET responses
    if (useCache && result && result.success) {
      const cachePayload = { data: result, timestamp: Date.now() };
      API_CACHE.set(cacheKey, cachePayload);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(cachePayload));
      } catch (e) {}
    }

    return result;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}
