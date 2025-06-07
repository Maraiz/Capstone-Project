import LoginModel from './login-model.js';

export default class LoginPresenter {
  constructor(view) {
    this.view = view;
    this.model = new LoginModel();
  }

  checkAuthState() {
    // ✅ Gunakan method yang lebih robust
    if (this.model.isAuthenticated()) {
      this.view.showMessage('Anda sudah login', 'info');
      setTimeout(() => {
        window.location.hash = '/home';
      }, 1500);
    }
  }

  async handleLogin(email, password) {
    if (!email || !password) {
      this.view.showMessage('Mohon lengkapi semua field', 'error');
      return;
    }

    this.view.showLoading(true);

    try {
      const response = await this.model.loginUser(email, password);

      if (response.success) {
        this.model.setToken(response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        this.view.showMessage('Login berhasil! Mengalihkan...', 'success');
        
        // ✅ Tunggu sebentar sebelum redirect untuk UX yang lebih baik
        setTimeout(() => {
          window.location.hash = '/home';
        }, 1500);
      } else {
        this.view.showMessage(response.message || 'Login gagal. Silakan coba lagi.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.view.showMessage('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      this.view.showLoading(false);
    }
  }
}