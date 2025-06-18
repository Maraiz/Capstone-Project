// CSS imports
import '../styles/base.css';
import '../styles/header.css';
import '../styles/mobile.css';
import '../styles/components.css';
import '../styles/login.css'; // Tambahkan import login.css
import '../styles/register.css'; // Tambahkan ini
import '../styles/landing.css'; 
import '../styles/home.css';

import App from './pages/app.js';

document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();
    console.log('Berhasil mendaftarkan service worker.');

  console.log('Berhasil mendaftarkan service worker.');

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
    overlay: document.querySelector('#overlay'),
    navList: document.querySelector('#nav-list'),
  });
  
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🔄 Registering service worker...');

      const registration = await navigator.serviceWorker.register(
        '/sw.bundle.js',
        {
          scope: '/',
          updateViaCache: 'none',
        }
      );

      console.log(
        '✅ Service Worker registered successfully:',
        registration.scope
      );

      handleServiceWorkerUpdates(registration);

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service worker controller changed, reloading page');
        window.location.reload();
      });

      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('⚠️ Service Worker not supported in this browser');
    return null;
  }
}

function handleServiceWorkerUpdates(registration) {
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    console.log('🆕 New service worker found');

    newWorker.addEventListener('statechange', () => {
      if (
        newWorker.state === 'installed' &&
        navigator.serviceWorker.controller
      ) {
        console.log('📦 New service worker installed, update available');
        console.log('💡 Refresh halaman untuk mendapatkan update terbaru');

        setTimeout(() => {
          console.log('🔄 Auto-updating service worker...');
          newWorker.postMessage({ type: 'SKIP_WAITING' });
        }, 5000);
      }
    });
  });
}