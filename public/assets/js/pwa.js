/**
 * CJM Motor PWA Installer & Service Worker Registration Script
 */

let deferredPrompt = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW Registered:', reg.scope))
      .catch(err => console.warn('SW Reg Failed:', err));
  });
}

// Capture Chrome beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showPwaInstallBanner();
});

function showPwaInstallBanner() {
  if (document.getElementById('pwa-install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.className = 'fixed bottom-4 left-4 right-4 max-w-lg mx-auto bg-blue-950 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between border border-blue-800 animate-bounce-short';
  banner.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center font-bold text-white shadow-inner">
        <span class="material-symbols-outlined text-xl">get_app</span>
      </div>
      <div>
        <h4 class="font-extrabold text-xs text-white">Install Aplikasi CJM Motor</h4>
        <p class="text-[10px] text-blue-200">Akses cepat & offline di layar HP/Chrome Anda</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="dismissPwaBanner()" class="p-1.5 text-blue-300 hover:text-white"><span class="material-symbols-outlined text-base">close</span></button>
      <button onclick="triggerPwaInstall()" class="h-9 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-transform">
        Install
      </button>
    </div>
  `;

  document.body.appendChild(banner);
}

function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA prompt');
      }
      deferredPrompt = null;
      dismissPwaBanner();
    });
  }
}

function dismissPwaBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
}
