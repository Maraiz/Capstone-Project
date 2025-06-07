import HomeModel from './home-model.js';

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.model = new HomeModel();
  }

  checkAuthState() {
    if (!this.model.getToken()) {
      this.view.showMessage('Silakan login terlebih dahulu', 'error');
      setTimeout(() => {
        window.location.hash = '/login';
      }, 1500);
    }
  }

  handleLogout() {
    this.model.clearAuth();
    this.view.showMessage('Logout berhasil! Mengalihkan ke halaman awal...', 'success');
    setTimeout(() => {
      window.location.hash = '/';
    }, 1500);
  }
}