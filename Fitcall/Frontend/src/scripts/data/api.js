import axios from 'axios';
import CONFIG from '../config.js';

// Create axios instance
const apiClient = axios.create({
  baseURL: CONFIG.BASE_URL,
  timeout: 30000,
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
// SESSION MANAGEMENT
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
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    return null;
  }
  return token;
}

export function removeToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('token') || key === 'user')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export function forceLogout() {
  removeToken();
  window.location.hash = '/login';
  window.location.reload();
}

export async function logout() {
  try {
    await apiClient.delete('/logout');
    console.log('Logout API success');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    removeToken();
    window.location.hash = '/login';
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
}

export function isAuthenticated() {
  const token = getToken();
  const user = getCurrentUser();
  return !!(token && user && token.length > 10);
}

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
    localStorage.removeItem('user');
    return null;
  }
}

export function clearAuthData() {
  removeToken();
  console.log('Auth data cleared');
}

// ================================
// REGISTER API
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
// LOGIN API
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
// USER PROFILE API
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

// ================================
// IMAGE PREDICTION API
// ================================
export async function predictImage(imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post('/predict-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data: response.data,
      message: 'Image prediction successful'
    };
  } catch (error) {
    console.error('Image prediction error:', error);
    
    let errorMessage = 'Gagal melakukan prediksi gambar';
    let statusCode = null;

    if (error.response) {
      statusCode = error.response.status;
      const serverMessage = error.response.data?.error;

      switch (statusCode) {
        case 400:
          errorMessage = serverMessage || 'Gambar tidak valid';
          break;
        case 401:
          errorMessage = 'Token tidak valid, silakan login ulang';
          forceLogout();
          break;
        case 500:
          errorMessage = 'Server sedang bermasalah atau model gagal memproses gambar';
          break;
        default:
          errorMessage = serverMessage || `Error ${statusCode}`;
      }
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Coba lagi dalam beberapa saat';
    }

    return {
      success: false,
      message: errorMessage,
      statusCode: statusCode
    };
  }
}

export async function calculateWorkoutCalories({ gerakan, durasi }) {
  try {
    const response = await apiClient.post('/calculate-workout', {
      gerakan,
      durasi
    });

    return {
      success: true,
      data: response.data.hasil,
      message: response.data.message || 'Kalori berhasil dihitung'
    };
  } catch (error) {
    console.error('Calculate workout calories error:', error);
    
    let errorMessage = 'Gagal menghitung kalori';
    let statusCode = null;

    if (error.response) {
      statusCode = error.response.status;
      const serverMessage = error.response.data?.error;

      switch (statusCode) {
        case 400:
          errorMessage = serverMessage || 'Data tidak valid';
          break;
        case 401:
          errorMessage = 'Token tidak valid, silakan login ulang';
          forceLogout();
          break;
        case 404:
          errorMessage = 'Gerakan tidak ditemukan';
          break;
        case 500:
          errorMessage = 'Server sedang bermasalah';
          break;
        default:
          errorMessage = serverMessage || `Error ${statusCode}`;
      }
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Coba lagi dalam beberapa saat';
    }

    return {
      success: false,
      message: errorMessage,
      statusCode: statusCode,
      availableExercises: error.response?.data?.availableExercises || null
    };
  }
}

// Fungsi untuk mendapatkan daftar exercise yang tersedia
export async function getAvailableExercises() {
  try {
    const response = await apiClient.get('/exercises');

    return {
      success: true,
      data: response.data.exercises,
      total: response.data.total,
      message: 'Daftar exercise berhasil diambil'
    };
  } catch (error) {
    console.error('Get exercises error:', error);
    
    let errorMessage = 'Gagal mengambil daftar exercise';

    if (error.response) {
      const serverMessage = error.response.data?.error;
      errorMessage = serverMessage || errorMessage;
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server';
    }

    return {
      success: false,
      message: errorMessage
    };
  }
}

export async function saveWorkoutSession(sessionData) {
  try {
    const response = await apiClient.post('/workout-sessions', sessionData);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Workout session berhasil disimpan'
    };
  } catch (error) {
    console.error('Save workout session error:', error);
    
    let errorMessage = 'Gagal menyimpan workout session';
    let statusCode = null;

    if (error.response) {
      statusCode = error.response.status;
      const serverMessage = error.response.data?.error;
      errorMessage = serverMessage || errorMessage;
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

// Get workout sessions
export async function getWorkoutSessions(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/workout-sessions${queryParams ? '?' + queryParams : ''}`;
    
    const response = await apiClient.get(url);

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
      statistics: response.data.statistics,
      message: 'Data workout sessions berhasil diambil'
    };
  } catch (error) {
    console.error('Get workout sessions error:', error);
    
    let errorMessage = 'Gagal mengambil data workout sessions';

    if (error.response) {
      const serverMessage = error.response.data?.error;
      errorMessage = serverMessage || errorMessage;
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server';
    }

    return {
      success: false,
      message: errorMessage
    };
  }
}

// Get workout session by ID
export async function getWorkoutSessionById(id) {
  try {
    const response = await apiClient.get(`/workout-sessions/${id}`);

    return {
      success: true,
      data: response.data.data,
      message: 'Data workout session berhasil diambil'
    };
  } catch (error) {
    console.error('Get workout session by ID error:', error);
    
    let errorMessage = 'Gagal mengambil data workout session';

    if (error.response) {
      const serverMessage = error.response.data?.error;
      errorMessage = serverMessage || errorMessage;
    }

    return {
      success: false,
      message: errorMessage
    };
  }
}

// Update workout session
export async function updateWorkoutSession(id, updateData) {
  try {
    const response = await apiClient.put(`/workout-sessions/${id}`, updateData);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Workout session berhasil diupdate'
    };
  } catch (error) {
    console.error('Update workout session error:', error);
    
    let errorMessage = 'Gagal mengupdate workout session';

    if (error.response) {
      const serverMessage = error.response.data?.error;
      errorMessage = serverMessage || errorMessage;
    }

    return {
      success: false,
      message: errorMessage
    };
  }
}

// Delete workout session
export async function deleteWorkoutSession(id) {
  try {
    const response = await apiClient.delete(`/workout-sessions/${id}`);

    return {
      success: true,
      message: response.data.message || 'Workout session berhasil dihapus'
    };
  } catch (error) {
    console.error('Delete workout session error:', error);
    
    let errorMessage = 'Gagal menghapus workout session';

    if (error.response) {
      const serverMessage = error.response.data?.error;
      errorMessage = serverMessage || errorMessage;
    }

    return {
      success: false,
      message: errorMessage
    };
  }
}

// Get workout statistics
export async function getWorkoutStatistics(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/workout-sessions/statistics${queryParams ? '?' + queryParams : ''}`;
    
    const response = await apiClient.get(url);

    return {
      success: true,
      data: response.data.data,
      summary: response.data.summary,
      message: 'Statistik workout berhasil diambil'
    };
  } catch (error) {
    console.error('Get workout statistics error:', error);
    
    let errorMessage = 'Gagal mengambil statistik workout';

    if (error.response) {
      const serverMessage = error.response.data?.error;
      errorMessage = serverMessage || errorMessage;
    }

    return {
      success: false,
      message: errorMessage
    };
  }
}

export { apiClient };