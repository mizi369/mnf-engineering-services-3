import { registerSW } from 'virtual:pwa-register';

export function setupPWA() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('Sistem dikemaskini. Muat semula sekarang?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('[PWA] Sistem sedia untuk mod luar talian.');
      },
    });
  }
}
