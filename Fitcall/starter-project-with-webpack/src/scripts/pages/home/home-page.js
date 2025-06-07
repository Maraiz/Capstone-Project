// home-page.js
import HomePresenter from './home-presenter.js';
import HomeModel from './home-model.js';

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
    this.model = new HomeModel();
  }

  async render() {
    // Check authentication status before rendering
    if (!this.model.getToken()) {
      return `
        <div class="no-access-container">
          <h1 class="no-access-title">No Access</h1>
          <p class="no-access-message">Silakan login terlebih dahulu untuk mengakses halaman ini.</p>
        </div>
      `;
    }

    // Get user data
    const userData = this.model.getUserData();
    const userName = userData?.name || 'User';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    // Get current date
    const currentDate = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentDay = currentDate.getDate();
    const currentDayName = dayNames[currentDate.getDay()];
    const currentYear = currentDate.getFullYear();

    // Render full UI for authenticated users
    return `
      <div class="home-container">
        <div class="home-header">
          <div class="profile-section">
            <div class="profile-avatar">${userInitials}</div>
            <div class="profile-info">
              <div class="profile-name">${userName}</div>
              <div class="profile-status">Ready to workout</div>
            </div>
          </div>
          
          <div class="home-logo">FitCall</div>
          
          <div class="header-actions">
            <button class="notification-btn">
              <i class="fas fa-bell"></i>
            </button>
            <button class="btn btn-primary" id="logoutBtn">Logout</button>
          </div>
        </div>

        <div class="date-section">
          <h1 class="date-title">${currentMonth} ${currentDay}</h1>
          <p class="date-subtitle">${currentDayName}, ${currentDay} ${currentMonth} ${currentYear}</p>
        </div>

        <div class="dashboard">
          <div class="card calories-card">
            <div class="card-header">
              <h3 class="card-title">Kalori Hari Ini</h3>
              <div class="card-icon">
                <i class="fas fa-fire"></i>
              </div>
            </div>
            
            <div class="calories-content">
              <div class="circular-progress">
                <div class="progress-ring">
                  <div class="progress-text">
                    <div class="progress-number">0/500</div>
                    <div class="progress-label">kkal tersisa</div>
                  </div>
                </div>
              </div>
              
              <div class="calories-stats">
                <div class="stat-item">
                  <div class="stat-icon target">
                    <i class="fas fa-bullseye"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">Target Kalori</div>
                    <div class="stat-value">500 kkal</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon burned">
                    <i class="fas fa-fire-flame-curved"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">Kalori Terbakar</div>
                    <div class="stat-value">0 kkal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card diet-card">
            <div class="diet-content">
              <div class="diet-badge">Diet Guide</div>
              <h3 class="diet-title">Lose Your Weight</h3>
              <div class="diet-duration">30 Hari Program</div>
              
              <div class="diet-progress">
                <div class="diet-progress-label">30 hari tersisa</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 0%"></div>
                </div>
              </div>
            </div>
            <div class="diet-illustration">🏃‍♀️</div>
          </div>
        </div>

        <div class="daily-section">
          <div class="daily-header">
            <div class="daily-icon">
              <i class="fas fa-calendar-day"></i>
            </div>
            <h3 class="daily-title">Hari 1 - Memulai Perjalanan</h3>
          </div>
          <p class="daily-description">
            Selamat datang di program fitness Anda, ${userName}! Hari ini adalah langkah pertama menuju hidup yang lebih sehat. 
            Mari mulai dengan latihan ringan dan bangun kebiasaan positif yang akan bertahan lama.
          </p>
        </div>

        <div class="home-footer">
          <p class="footer-text">© 2025 FitCall Gym. All rights reserved.</p>
        </div>
      </div>
    `;
  }

  async afterRender() {
    // Only initialize event listeners for authenticated users
    if (this.model.getToken()) {
      this.initializeEventListeners();
    }
    // Always check auth state to trigger redirect if needed
    this.presenter.checkAuthState();
  }

  initializeEventListeners() {
    // Initialize notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => {
        this.showMessage('Notifikasi diklik', 'info');
      });
    }

    // Initialize profile avatar
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
      profileAvatar.addEventListener('click', () => {
        this.showMessage('Profil diklik', 'info');
      });
    }

    // Initialize logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.presenter.handleLogout();
      });
    }

    // Animate progress bar
    setTimeout(() => {
      const progressFill = document.querySelector('.progress-fill');
      if (progressFill) {
        progressFill.style.width = '0%'; // Update based on actual progress
      }
    }, 500);
  }

  showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create and show new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 4000);
  }
}