import { loginUser, setToken, getToken, isAuthenticated } from '../../../data/api.js';

export default class LoginModel {
  setToken(token) {
    setToken(token);
  }

  getToken() {
    return getToken();
  }

  // ✅ Tambahkan method untuk cek auth
  isAuthenticated() {
    return isAuthenticated();
  }

  async loginUser(email, password) {
    return await loginUser({ email, password });
  }
}