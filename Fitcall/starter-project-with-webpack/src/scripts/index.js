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