import axios from 'axios';
import CONFIG from '../config.js';

// Create axios instance
const apiClient = axios.create({
  baseURL: CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor untuk attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors dan auto logout
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Auto logout jika token expired atau unauthorized
    if (error.response?.status === 401) {
      console.log('Token expired, logging out...');
      forceLogout();
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ================================
// SESSION MANAGEMENT - FIXED
// ================================

export function setToken(token) {
  if (token && token !== 'null' && token !== 'undefined') {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

export function getToken() {
  const token = localStorage.getItem('authToken');
  // ✅ Handle null string dan return null jika tidak valid
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    return null;
  }
  return token;
}

export function removeToken() {
  // ✅ Hapus semua data auth dari localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken'); // jika ada
  
  // ✅ Clear semua item yang mungkin ada
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('token') || key === 'user')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// ✅ Fungsi untuk force logout tanpa API call
export function forceLogout() {
  removeToken();
  window.location.hash = '/login';
  window.location.reload(); // ✅ Reload untuk clear state
}

// ✅ Perbaiki fungsi logout
export async function logout() {
  try {
    // Panggil API logout untuk clear refresh token di server
    await apiClient.delete('/logout');
    console.log('Logout API success');
  } catch (error) {
    console.error('Logout API error:', error);
    // Tetap lanjut logout meski API error
  } finally {
    // ✅ Pastikan clear semua data
    removeToken();
    
    // ✅ Redirect dan reload
    window.location.hash = '/login';
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
}

// ✅ Perbaiki fungsi isAuthenticated
export function isAuthenticated() {
  const token = getToken();
  const user = getCurrentUser();
  
  // ✅ Harus ada token yang valid DAN user data
  return !!(token && user && token.length > 10); // token minimal 10 karakter
}

// ✅ Tambahkan fungsi untuk get user data
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'null' || userStr === 'undefined') {
      return null;
    }
    const user = JSON.parse(userStr);
    return user && typeof user === 'object' ? user : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user'); // Remove corrupted data
    return null;
  }
}

// ✅ Tambahkan fungsi untuk clear all auth data
export function clearAuthData() {
  removeToken();
  console.log('Auth data cleared');
}

// ================================
// REGISTER API (tetap sama)
// ================================
export async function registerUser(userData) {
  try {
    const response = await apiClient.post('/users', userData);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.msg || 'Registrasi berhasil!'
    };
  } catch (error) {
    return handleRegisterError(error);
  }
}

function handleRegisterError(error) {
  let errorMessage = 'Terjadi kesalahan saat registrasi';
  let statusCode = null;
  
  if (error.response) {
    statusCode = error.response.status;
    const serverMessage = error.response.data?.msg;
    const validationErrors = error.response.data?.errors;
    
    switch (statusCode) {
      case 400:
        if (validationErrors && validationErrors.length > 0) {
          errorMessage = 'Data tidak valid:\n' + 
            validationErrors.map(err => `- ${err.message}`).join('\n');
        } else if (serverMessage) {
          if (serverMessage.includes('Email sudah terdaftar')) {
            errorMessage = 'Email sudah terdaftar. Gunakan email lain atau login';
          } else if (serverMessage.includes('Username sudah digunakan')) {
            errorMessage = 'Username sudah digunakan. Pilih username lain';
          } else if (serverMessage.includes('Password dan Confirm Password tidak cocok')) {
            errorMessage = 'Password dan konfirmasi password tidak cocok';
          } else if (serverMessage.includes('wajib diisi')) {
            errorMessage = 'Mohon lengkapi semua data yang diperlukan';
          } else {
            errorMessage = serverMessage;
          }
        }
        break;
        
      case 500:
        errorMessage = 'Server sedang bermasalah. Coba lagi dalam beberapa saat';
        break;
        
      default:
        errorMessage = serverMessage || `Error ${statusCode}: Terjadi kesalahan`;
    }
  } else if (error.request) {
    errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda';
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'Request timeout. Coba lagi dalam beberapa saat';
  }
  
  console.error('Registration API Error:', error);
  
  return {
    success: false,
    error: error,
    message: errorMessage,
    statusCode: statusCode,
    validationErrors: error.response?.data?.errors || null
  };
}

// ================================
// LOGIN API (tetap sama)
// ================================
export async function loginUser({ email, password }) {
  try {
    const response = await apiClient.post('/login', { email, password });
    
    return {
      success: true,
      accessToken: response.data.accessToken,
      user: response.data.user,
      message: response.data.msg || 'Login berhasil!'
    };
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat login';
    let statusCode = null;

    if (error.response) {
      statusCode = error.response.status;
      const serverMessage = error.response.data?.msg;

      switch (statusCode) {
        case 400:
          errorMessage = serverMessage || 'Email atau password tidak valid';
          break;
        case 404:
          errorMessage = serverMessage || 'Email tidak ditemukan';
          break;
        case 500:
          errorMessage = 'Server sedang bermasalah. Coba lagi dalam beberapa saat';
          break;
        default:
          errorMessage = serverMessage || `Error ${statusCode}: Terjadi kesalahan`;
      }
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Coba lagi dalam beberapa saat';
    }

    console.error('Login API Error:', error);

    return {
      success: false,
      message: errorMessage,
      statusCode: statusCode
    };
  }
}

// ================================
// USER PROFILE API - TAMBAH INI
// ================================
export async function getUserProfile() {
  try {
    const response = await apiClient.get('/users');
    
    return {
      success: true,
      data: response.data,
      message: 'User profile fetched successfully'
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    
    let errorMessage = 'Gagal mengambil data profil';
    let statusCode = null;

    if (error.response) {
      statusCode = error.response.status;
      const serverMessage = error.response.data?.msg;

      switch (statusCode) {
        case 401:
          errorMessage = 'Token tidak valid, silakan login ulang';
          forceLogout();
          break;
        case 404:
          errorMessage = 'User tidak ditemukan';
          break;
        case 500:
          errorMessage = 'Server sedang bermasalah';
          break;
        default:
          errorMessage = serverMessage || `Error ${statusCode}`;
      }
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server';
    }

    return {
      success: false,
      message: errorMessage,
      statusCode: statusCode
    };
  }
}

export { apiClient };