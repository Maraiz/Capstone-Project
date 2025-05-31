export default class HomePage {
  async render() {
    return `
      <div class="home-container">
        <div class="home-header">
          <div class="profile-section">
            <div class="profile-avatar">JD</div>
            <div class="profile-info">
              <div class="profile-name">John Doe</div>
              <div class="profile-status">Ready to workout</div>
            </div>
          </div>
          
          <div class="home-logo">FitCall</div>
          
          <div class="header-actions">
            <button class="notification-btn">
              <i class="fas fa-bell"></i>
            </button>
          </div>
        </div>

        <div class="date-section">
          <h1 class="date-title">Mei 24</h1>
          <p class="date-subtitle">Sabtu, 31 Mei 2025</p>
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
            Selamat datang di program fitness Anda! Hari ini adalah langkah pertama menuju hidup yang lebih sehat. 
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
    // Initialize notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => {
        // Handle notification click
        console.log('Notification clicked');
      });
    }

    // Initialize profile avatar
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
      profileAvatar.addEventListener('click', () => {
        // Handle profile click
        console.log('Profile clicked');
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
}