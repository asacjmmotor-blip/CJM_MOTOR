/**
 * Central Fetch API Client with High-Performance Memory & Storage Caching
 * Includes Global Loading Animation & Success/Error Toast Notifications
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

/**
 * Global Toast Alert Notification System
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 * @param {number} duration 
 */
function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('global-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-toast-container';
    container.className = 'fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-emerald-950 border-emerald-700 text-white' : 'bg-red-950 border-red-700 text-white';
  const iconName = isSuccess ? 'check_circle' : 'error';
  const iconColor = isSuccess ? 'text-emerald-400' : 'text-red-400';

  toast.className = `pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-[-10px] opacity-0 ${bgColor}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor} text-xl shrink-0 mt-0.5">${iconName}</span>
    <div class="flex-1 text-xs font-bold leading-relaxed">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white shrink-0">
      <span class="material-symbols-outlined text-sm">close</span>
    </button>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-[-10px]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-[-10px]', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Global Fullscreen Loading Overlay with Spinner
 * @param {string} text 
 */
function showLoading(text = 'Memproses data...') {
  let overlay = document.getElementById('global-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'global-loading-overlay';
    overlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200 opacity-0 pointer-events-auto';
    overlay.innerHTML = `
      <div class="bg-white rounded-3xl p-6 shadow-2xl flex items-center gap-4 border border-slate-200 max-w-xs w-full">
        <span class="material-symbols-outlined text-3xl text-blue-950 animate-spin">progress_activity</span>
        <div>
          <p id="global-loading-text" class="font-extrabold text-blue-950 text-xs">${text}</p>
          <p class="text-[11px] text-slate-500 mt-0.5">Mohon tunggu sebentar...</p>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('global-loading-text').textContent = text;
  }

  requestAnimationFrame(() => {
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-100');
  });
}

/**
 * Hide Global Loading Overlay
 */
function hideLoading() {
  const overlay = document.getElementById('global-loading-overlay');
  if (overlay) {
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    setTimeout(() => overlay.remove(), 200);
  }
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

/**
 * Automatically sync admin name & avatar image across all sidebar/drawers
 */
function syncAdminProfileUi() {
  const savedName = localStorage.getItem('admin_name');
  const savedPhoto = localStorage.getItem('admin_profile_photo');

  if (savedName) {
    const drawerNameEls = document.querySelectorAll('#drawer-admin-name, .drawer-admin-name');
    drawerNameEls.forEach(el => {
      el.textContent = savedName;
    });
  }

  if (savedPhoto) {
    const drawerImgEls = document.querySelectorAll('#drawer-avatar-img, .drawer-avatar-img');
    const drawerIconEls = document.querySelectorAll('#drawer-avatar-icon, .drawer-avatar-icon');
    
    drawerImgEls.forEach(img => {
      img.src = savedPhoto;
      img.classList.remove('hidden');
    });
    drawerIconEls.forEach(icon => {
      icon.classList.add('hidden');
    });
  }
}

/**
 * Automatically render/update Workshop Info on CS pages
 */
async function syncWorkshopInfoUi() {
  const wNameEl = document.getElementById('cs-workshop-name');
  const wAddrEl = document.getElementById('cs-workshop-address');
  const wPhoneEl = document.getElementById('cs-workshop-phone');
  const wPhoneLinkEl = document.getElementById('cs-workshop-phone-link');
  const wHoursEl = document.getElementById('cs-workshop-hours');

  if (!wNameEl && !wAddrEl && !wPhoneEl) return;

  let wName = localStorage.getItem('workshop_name') || 'CJM Motor';
  let wPhone = localStorage.getItem('workshop_phone') || '0812-3456-7890';
  let wAddress = localStorage.getItem('workshop_address') || 'Jl. Contoh No. 123 Jakarta';
  let wOpenTime = localStorage.getItem('workshop_open_time') || '08:00';
  let wCloseTime = localStorage.getItem('workshop_close_time') || '20:00';
  let wDays = localStorage.getItem('workshop_operating_days') || 'Senin - Sabtu';

  function applyData() {
    if (wNameEl) wNameEl.textContent = wName;
    if (wAddrEl) wAddrEl.textContent = wAddress;
    if (wPhoneEl) wPhoneEl.textContent = wPhone;
    if (wHoursEl) wHoursEl.textContent = `${wDays} (${wOpenTime} - ${wCloseTime} WIB)`;
    if (wPhoneLinkEl) {
      const cleanPhone = wPhone.replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
      wPhoneLinkEl.href = `https://wa.me/${waNumber}`;
    }
  }

  // Render fast initial cached data
  applyData();

  // Fetch real-time up-to-date info from server API
  try {
    const res = await apiRequest('/auth/profile', 'GET', null, { useCache: false });
    if (res && res.success && res.data) {
      const d = res.data;
      if (d.workshop_name) {
        wName = d.workshop_name;
        localStorage.setItem('workshop_name', wName);
      }
      if (d.workshop_phone) {
        wPhone = d.workshop_phone;
        localStorage.setItem('workshop_phone', wPhone);
      }
      if (d.workshop_address) {
        wAddress = d.workshop_address;
        localStorage.setItem('workshop_address', wAddress);
      }
      if (d.workshop_open_time) {
        wOpenTime = d.workshop_open_time;
        localStorage.setItem('workshop_open_time', wOpenTime);
      }
      if (d.workshop_close_time) {
        wCloseTime = d.workshop_close_time;
        localStorage.setItem('workshop_close_time', wCloseTime);
      }
      if (d.workshop_operating_days) {
        wDays = d.workshop_operating_days;
        localStorage.setItem('workshop_operating_days', wDays);
      }

      applyData();
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncAdminProfileUi();
      syncWorkshopInfoUi();
    });
  } else {
    syncAdminProfileUi();
    syncWorkshopInfoUi();
  }
}
