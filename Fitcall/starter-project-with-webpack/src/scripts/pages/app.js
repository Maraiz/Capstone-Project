import routes from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #overlay = null;
  #navList = null;

  constructor({ navigationDrawer, drawerButton, content, overlay, navList }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#overlay = overlay;
    this.#navList = navList;

    this._setupDrawer();
    this._setupNavigation();
    this._setupEventListeners();
  }

  _setupDrawer() {
    this.#drawerButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleDrawer();
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer?.contains(event.target) && 
          !this.#drawerButton?.contains(event.target)) {
        this._closeDrawer();
      }
    });

    this.#navigationDrawer?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this._closeDrawer();
        }
      });
    });

    this.#overlay?.addEventListener('click', () => {
      this._closeDrawer();
    });
  }

  _setupNavigation() {
    this._updateActiveNavigation();
    
    window.addEventListener('hashchange', () => {
      this._updateActiveNavigation();
    });
  }

  _setupEventListeners() {
    window.addEventListener('resize', () => {
      this._handleResize();
    });

    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this._handleError(e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this._handleError(e.reason);
    });
  }

  _toggleDrawer() {
    this.#navigationDrawer?.classList.toggle('open');
    this.#overlay?.classList.toggle('show');
  }

  _closeDrawer() {
    this.#navigationDrawer?.classList.remove('open');
    this.#overlay?.classList.remove('show');
  }

  _updateActiveNavigation() {
    const currentUrl = getActiveRoute();
    const navLinks = this.#navList?.querySelectorAll('a');
    
    if (navLinks) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        const linkUrl = link.getAttribute('href')?.slice(1) || '/';
        if (linkUrl === currentUrl) {
          link.classList.add('active');
        }
      });
    }

    // Handle page-specific styling
    this._handlePageStyling(currentUrl);
  }

  _handlePageStyling(url) {
    const body = document.body;
    const header = document.getElementById('main-header');
    const mainContent = document.getElementById('main-content');
    
    // Remove all page-specific classes
    body.classList.remove('landing-page', 'login-page', 'register-page', 'home-page');
    
    // Add page-specific class and handle header visibility
    if (url === '/' || url === '/landing') {
      body.classList.add('landing-page');
      // Hide main header for landing page
      if (header) header.style.display = 'none';
      if (mainContent) mainContent.style.minHeight = '100vh';
    } else if (url === '/home') { // Tambahan untuk home page
      body.classList.add('home-page');
      // Hide main header for home page
      if (header) header.style.display = 'none';
      if (mainContent) mainContent.style.minHeight = '100vh';
    } else {
      // Show main header for other pages (login, register, dll)
      if (header) header.style.display = 'block';
      if (mainContent) mainContent.style.minHeight = 'calc(100vh - 70px)';
      
      if (url === '/login') {
        body.classList.add('login-page');
      } else if (url === '/register') {
        body.classList.add('register-page');
      }
    }
  }

  _handleResize() {
    if (window.innerWidth > 768) {
      this._closeDrawer();
    }
  }

  _handleError(error) {
    console.error('Application error:', error);
    this.#content.innerHTML = this._renderErrorPage(error);
  }

  _renderErrorPage(error) {
    return `
      <div class="error-page">
        <div class="error-code">Oops!</div>
        <div class="error-message">
          Terjadi kesalahan saat memuat halaman.
          <br>
          <small>${error?.message || 'Unknown error'}</small>
        </div>
        <a href="#/" class="error-link">Kembali ke Beranda</a>
      </div>
    `;
  }

  _render404Page() {
    return `
      <div class="error-page">
        <div class="error-code">404</div>
        <div class="error-message">
          Halaman yang Anda cari tidak ditemukan.
        </div>
        <a href="#/" class="error-link">Kembali ke Beranda</a>
      </div>
    `;
  }

  _showLoading() {
    this.#content.innerHTML = '<div class="loading">Loading...</div>';
  }

  async renderPage() {
    try {
      this._showLoading();

      const url = getActiveRoute();
      const page = routes[url];

      this._updateActiveNavigation();

      if (page) {
        const pageContent = await page.render();
        this.#content.innerHTML = pageContent;
        
        if (typeof page.afterRender === 'function') {
          await page.afterRender();
        }
      } else {
        this.#content.innerHTML = this._render404Page();
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      this._handleError(error);
    }
  }

  getCurrentRoute() {
    return getActiveRoute();
  }

  navigateTo(url) {
    window.location.hash = url;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.navigateTo('/login');
  }
}

export default App;