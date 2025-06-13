import HomePresenter from './home-presenter.js';
import HomeModel from './home-model.js';

export default class HomePage {
  constructor() {
    // **FIX 1: Share same model instance between presenter and page**
    this.model = new HomeModel();
    this.presenter = new HomePresenter(this, this.model); // Pass shared model
    this.cameraStream = null;
    this.currentDate = new Date(); // Current displayed date
    this.firstActivityDate = null; // Will be set based on user data
    this.todayDate = new Date(); // Today's date for max boundary
    
    // Set global reference for event handlers
    window.homePage = this;
  }

  async render() {
    if (!this.model.getToken()) {
      return `
        <div class="no-access-container">
          <h1 class="no-access-title">No Access</h1>
          <p class="no-access-message">Silakan login terlebih dahulu untuk mengakses halaman ini.</p>
        </div>
      `;
    }

    const userData = await this.model.getUserData();

    if (!userData) {
      return `
        <div class="error-container">
          <h1 class="error-title">Error</h1>
          <p class="error-message">Gagal mengambil data user. Silakan refresh halaman atau login ulang.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Refresh</button>
          <button class="btn btn-secondary" onclick="window.location.hash='/login'">Login Ulang</button>
        </div>
      `;
    }

    // Set first activity date (assuming it's in userData, or default to a month ago for demo)
    this.firstActivityDate = userData.firstActivityDate 
      ? new Date(userData.firstActivityDate) 
      : new Date(this.todayDate.getFullYear(), this.todayDate.getMonth() - 1, this.todayDate.getDate());
    
    // Ensure firstActivityDate is not after today
    if (this.firstActivityDate > this.todayDate) {
      this.firstActivityDate = new Date(this.todayDate);
    }

    const userName = userData?.name || 'User';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const currentMonth = monthNames[this.currentDate.getMonth()];
    const currentDay = this.currentDate.getDate();
    const currentDayName = dayNames[this.currentDate.getDay()];
    const currentYear = this.currentDate.getFullYear();
    const targetCalories = userData?.targetCalories || 500;

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
          <div class="date-navigation">
            <button class="nav-btn prev" id="prevDateBtn">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="date-display">
              <h1 class="date-title">${currentMonth} ${currentDay}</h1>
              <p class="date-subtitle">${currentDayName}, ${currentDay} ${currentMonth} ${currentYear}</p>
            </div>
            <button class="nav-btn next" id="nextDateBtn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
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
                    <div class="progress-number" id="calorieProgress">0/${targetCalories}</div>
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
                    <div class="stat-value">${targetCalories} kkal</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon burned">
                    <i class="fas fa-fire-flame-curved"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">Kalori Terbakar</div>
                    <div class="stat-value" id="caloriesBurned">0 kkal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card recently-card">
            <div class="recently-content">
              <h3 class="recently-title">Recently</h3>
              <div id="no-meals" class="no-meals">No Train's yet!</div>
              <p id="meal-suggestion" class="meal-suggestion">
                ambil sesuatu yang sehat, catat di sini,<br>
                dan periksa instagram kami <a href="#" class="instagram-link">@fitcal.ai</a>
              </p>
              <div id="meal-list" class="meal-list"></div>
            </div>
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

      <!-- Add Button -->
      <button class="add-btn" id="addBtn">
        <i class="fas fa-plus"></i>
      </button>

      <!-- Main Modal -->
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Tambah Latihan</h3>
            <button class="close-btn" id="closeModalBtn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <div class="modal-options">
              <div class="modal-option" id="cameraOption">
                <div class="modal-option-icon camera">
                  <i class="fas fa-camera"></i>
                </div>
                <div class="modal-option-text">Kamera</div>
              </div>
              <div class="modal-option" id="galleryOption">
                <div class="modal-option-icon album">
                  <i class="fas fa-images"></i>
                </div>
                <div class="modal-option-text">Galeri</div>
              </div>
              <div class="modal-option" id="favoriteOption">
                <div class="modal-option-icon favorite">
                  <i class="fas fa-heart"></i>
                </div>
                <div class="modal-option-text">Favorit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Camera Modal -->
      <div class="modal-overlay" id="cameraModalOverlay">
        <div class="camera-modal">
          <div class="modal-header">
            <h3 class="modal-title">Ambil Gambar Latihan</h3>
            <button class="close-btn" id="closeCameraModalBtn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <video id="cameraPreview" class="camera-preview" autoplay></video>
            <canvas id="cameraCanvas" style="display: none;"></canvas>
            <img id="capturedImage" class="camera-preview" style="display: none;">
            <select id="durationUnit" style="margin-bottom: 8px;">
              <option value="seconds">Detik</option>
              <option value="minutes">Menit</option>
            </select>
            <input type="number" id="mealDuration" placeholder="Durasi (min. 10 detik)" min="10" step="1">
            <button id="captureBtn">Ambil Gambar</button>
            <button id="saveMealBtn">Simpan</button>
          </div>
        </div>
      </div>

      <!-- Gallery Modal -->
      <div class="modal-overlay" id="galleryModalOverlay">
        <div class="camera-modal">
          <div class="modal-header">
            <h3 class="modal-title">Pilih dari Galeri</h3>
            <button class="close-btn" id="closeGalleryModalBtn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <input type="file" id="galleryInput" accept="image/*">
            <img id="galleryPreview" class="camera-preview" style="display: none;">
            <select id="galleryDurationUnit" style="margin-bottom: 8px;">
              <option value="seconds">Detik</option>
              <option value="minutes">Menit</option>
            </select>
            <input type="number" id="galleryMealDuration" placeholder="Durasi (min. 10 detik)" min="10" step="1">
            <button id="saveGalleryMealBtn">Simpan</button>
          </div>
        </div>
      </div>

      <!-- Exercise Modal -->
      <div class="modal-overlay" id="exerciseModalOverlay">
        <div class="exercise-modal">
          <div class="modal-header">
            <h3 class="modal-title" id="exerciseModalTitle">LONCAT BINTANG</h3>
            <button class="close-btn" id="closeExerciseModalBtn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <img id="exerciseModalImage" class="modal-image" src="" alt="Exercise Image">
          <div class="modal-duration" id="exerciseModalDuration">Durasi: 00:00</div>
          <div class="modal-calories" id="exerciseModalCalories">Kalori: 0 kkal</div>
          <div class="modal-options" id="exerciseOptions">
            <button class="modal-option-btn" id="startExerciseBtn">Mulai</button>
            <button class="modal-option-btn secondary" id="saveExerciseBtn">Simpan</button>
          </div>
          <div class="duration-counter" id="durationCounter">
            <button class="duration-btn" id="decreaseDurationBtn">-</button>
            <span class="duration-value" id="exerciseDuration">00:00</span>
            <button class="duration-btn" id="increaseDurationBtn">+</button>
          </div>
          <div class="loading-indicator" id="loadingIndicator"></div>
          <div class="timer" id="exerciseTimer">00:00</div>
          <button class="start-btn" id="startBtn">|| Jeda</button>
          <div class="completed-status" id="completedStatus">Selesai</div>
          <div class="prep-message" id="prepMessage"></div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    if (this.model.getToken()) {
      // **FIX 2: Proper initialization sequence**
      
      // Step 1: Set model's current date BEFORE initialization
      this.model.currentDate = new Date(this.currentDate);
      
      // Step 2: Initialize model
      await this.model.initialize();
      
      // Step 3: Get user data and set target calories
      const userData = await this.model.getUserData();
      if (userData) {
        const targetCalories = userData?.targetCalories || 500;
        this.presenter.setTargetCalories(targetCalories);
      }
      
      // Step 4: Initialize event listeners
      this.initializeEventListeners();
      
      // Step 5: Update displays
      this.presenter.updateCaloriesDisplay();
      this.updateDateDisplay();
      this.updateMealList(this.model.getMeals());
      
    } else {
      // Reset model if no token
      this.model.reset();
    }
    
    this.presenter.checkAuthState();
  }

  initializeEventListeners() {
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => {
        this.showMessage('Notifikasi diklik', 'info');
      });
    }

    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
      profileAvatar.addEventListener('click', () => {
        this.showMessage('Profil diklik', 'info');
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.presenter.handleLogout();
      });
    }

    const instagramLink = document.querySelector('.instagram-link');
    if (instagramLink) {
      instagramLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showMessage('Instagram link diklik!', 'info');
      });
    }

    // Date navigation event listeners
    const prevDateBtn = document.getElementById('prevDateBtn');
    const nextDateBtn = document.getElementById('nextDateBtn');

    if (prevDateBtn) {
      prevDateBtn.addEventListener('click', () => {
        this.navigateToPreviousDate();
      });
    }

    if (nextDateBtn) {
      nextDateBtn.addEventListener('click', () => {
        this.navigateToNextDate();
      });
    }

    this.initializeModalEventListeners();
    this.initializeCameraEventListeners();
    this.initializeGalleryEventListeners();
    this.initializeExerciseEventListeners();

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeAllModals();
      } else if (event.key === 'ArrowLeft') {
        this.navigateToPreviousDate();
      } else if (event.key === 'ArrowRight') {
        this.navigateToNextDate();
      }
    });

    setTimeout(() => {
      const progressFill = document.querySelector('.progress-fill');
      if (progressFill) {
        progressFill.style.width = '0%';
      }
    }, 500);
  }

  // Date Navigation Methods
  async navigateToPreviousDate() {
    const prevDate = new Date(this.currentDate);
    prevDate.setDate(this.currentDate.getDate() - 1);

    // Check if previous date is not before firstActivityDate
    if (prevDate >= this.firstActivityDate) {
      this.currentDate = prevDate;
      
      // **FIX 3: Sync dates properly**
      await this.model.setCurrentDate(this.currentDate);
      
      this.updateDateDisplay();
      this.showMessage('Navigasi ke hari sebelumnya', 'info');
      
      // Update UI dengan data yang baru
      this.presenter.updateCaloriesDisplay();
      this.updateMealList(this.model.getMeals());
    } else {
      this.showMessage('Tidak dapat navigasi sebelum aktivitas pertama', 'warning');
    }
  }

  async navigateToNextDate() {
    const nextDate = new Date(this.currentDate);
    nextDate.setDate(this.currentDate.getDate() + 1);

    // Check if next date is not after today
    if (nextDate <= this.todayDate) {
      this.currentDate = nextDate;
      
      // **FIX 4: Sync dates properly**
      await this.model.setCurrentDate(this.currentDate);
      
      this.updateDateDisplay();
      this.showMessage('Navigasi ke hari berikutnya', 'info');
      
      // Update UI dengan data yang baru
      this.presenter.updateCaloriesDisplay();
      this.updateMealList(this.model.getMeals());
    } else {
      this.showMessage('Tidak dapat navigasi melewati hari ini', 'warning');
    }
  }

  updateDateDisplay() {
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    const currentMonth = monthNames[this.currentDate.getMonth()];
    const currentDay = this.currentDate.getDate();
    const currentDayName = dayNames[this.currentDate.getDay()];
    const currentYear = this.currentDate.getFullYear();

    const dateTitle = document.querySelector('.date-title');
    const dateSubtitle = document.querySelector('.date-subtitle');

    if (dateTitle) {
      dateTitle.textContent = `${currentMonth} ${currentDay}`;
    }
    if (dateSubtitle) {
      dateSubtitle.textContent = `${currentDayName}, ${currentDay} ${currentMonth} ${currentYear}`;
    }

    // Update navigation button states
    const prevDateBtn = document.getElementById('prevDateBtn');
    const nextDateBtn = document.getElementById('nextDateBtn');

    if (prevDateBtn) {
      prevDateBtn.disabled = this.currentDate <= this.firstActivityDate;
      if (this.currentDate <= this.firstActivityDate) {
        prevDateBtn.style.opacity = '0.5';
        prevDateBtn.style.cursor = 'not-allowed';
      } else {
        prevDateBtn.style.opacity = '1';
        prevDateBtn.style.cursor = 'pointer';
      }
    }
    if (nextDateBtn) {
      nextDateBtn.disabled = this.currentDate >= this.todayDate;
      if (this.currentDate >= this.todayDate) {
        nextDateBtn.style.opacity = '0.5';
        nextDateBtn.style.cursor = 'not-allowed';
      } else {
        nextDateBtn.style.opacity = '1';
        nextDateBtn.style.cursor = 'pointer';
      }
    }
  }

  initializeModalEventListeners() {
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openModal();
      });
    }

    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeModal();
        }
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    const cameraOption = document.getElementById('cameraOption');
    const galleryOption = document.getElementById('galleryOption');
    const favoriteOption = document.getElementById('favoriteOption');

    if (cameraOption) {
      cameraOption.addEventListener('click', () => {
        this.openCameraModal();
      });
    }

    if (galleryOption) {
      galleryOption.addEventListener('click', () => {
        this.openGalleryModal();
      });
    }

    if (favoriteOption) {
      favoriteOption.addEventListener('click', () => {
        this.selectOption('favorite');
      });
    }
  }

  initializeCameraEventListeners() {
    const cameraModalOverlay = document.getElementById('cameraModalOverlay');
    const closeCameraModalBtn = document.getElementById('closeCameraModalBtn');
    const captureBtn = document.getElementById('captureBtn');
    const saveMealBtn = document.getElementById('saveMealBtn');

    if (cameraModalOverlay) {
      cameraModalOverlay.addEventListener('click', (e) => {
        if (e.target === cameraModalOverlay) {
          this.closeCameraModal();
        }
      });
    }

    if (closeCameraModalBtn) {
      closeCameraModalBtn.addEventListener('click', () => {
        this.closeCameraModal();
      });
    }

    if (captureBtn) {
      captureBtn.addEventListener('click', () => {
        this.captureImage();
      });
    }

    if (saveMealBtn) {
      saveMealBtn.addEventListener('click', () => {
        const duration = parseInt(document.getElementById('mealDuration').value) || 0;
        const unit = document.getElementById('durationUnit').value;
        const capturedImage = document.getElementById('capturedImage');

        // **FIX 5: Better validation for camera capture**
        const durationInSeconds = unit === 'minutes' ? duration * 60 : duration;
        if (!capturedImage.src || capturedImage.src === '' || capturedImage.src === 'data:,' || capturedImage.style.display === 'none') {
          this.showMessage('Silakan ambil gambar terlebih dahulu!', 'error');
          return;
        }
        
        if (durationInSeconds < 10) {
          this.showMessage('Durasi minimal 10 detik!', 'error');
          return;
        }

        // Debug: log gambar
        console.log('Saving camera image:', capturedImage.src.substring(0, 100) + '...');

        // Simpan referensi gambar sebelum tutup modal
        const imageDataToSave = capturedImage.src;

        // Langsung tutup modal
        this.closeCameraModal();
        this.closeModal();

        // Baru jalankan proses dengan gambar yang sudah disimpan
        this.presenter.handleCameraCapture(duration, unit, imageDataToSave);
      });
    }
  }

  initializeGalleryEventListeners() {
    const galleryModalOverlay = document.getElementById('galleryModalOverlay');
    const closeGalleryModalBtn = document.getElementById('closeGalleryModalBtn');
    const saveGalleryMealBtn = document.getElementById('saveGalleryMealBtn');
    const galleryInput = document.getElementById('galleryInput');

    if (galleryModalOverlay) {
      galleryModalOverlay.addEventListener('click', (e) => {
        if (e.target === galleryModalOverlay) {
          this.closeGalleryModal();
        }
      });
    }

    if (closeGalleryModalBtn) {
      closeGalleryModalBtn.addEventListener('click', () => {
        this.closeGalleryModal();
      });
    }

    if (galleryInput) {
      galleryInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const galleryPreview = document.getElementById('galleryPreview');
            galleryPreview.src = e.target.result;
            galleryPreview.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (saveGalleryMealBtn) {
      saveGalleryMealBtn.addEventListener('click', () => {
        const duration = parseInt(document.getElementById('galleryMealDuration').value) || 0;
        const unit = document.getElementById('galleryDurationUnit').value;
        const galleryPreview = document.getElementById('galleryPreview');

        // **FIX 6: Better validation for gallery upload**
        const durationInSeconds = unit === 'minutes' ? duration * 60 : duration;
        if (!galleryPreview.src || galleryPreview.src === '' || galleryPreview.src === 'data:,' || galleryPreview.style.display === 'none') {
          this.showMessage('Silakan pilih gambar terlebih dahulu!', 'error');
          return;
        }
        
        if (durationInSeconds < 10) {
          this.showMessage('Durasi minimal 10 detik!', 'error');
          return;
        }

        // Debug: log gambar
        console.log('Saving gallery image:', galleryPreview.src.substring(0, 100) + '...');

        // Simpan referensi gambar sebelum tutup modal
        const imageDataToSave = galleryPreview.src;

        // Langsung tutup modal
        this.closeGalleryModal();
        this.closeModal();

        // Baru jalankan proses dengan gambar yang sudah disimpan
        this.presenter.handleGalleryUpload(duration, unit, imageDataToSave);
      });
    }
  }

  initializeExerciseEventListeners() {
    const exerciseModalOverlay = document.getElementById('exerciseModalOverlay');
    const closeExerciseModalBtn = document.getElementById('closeExerciseModalBtn');
    const startExerciseBtn = document.getElementById('startExerciseBtn');
    const saveExerciseBtn = document.getElementById('saveExerciseBtn');
    const decreaseDurationBtn = document.getElementById('decreaseDurationBtn');
    const increaseDurationBtn = document.getElementById('increaseDurationBtn');
    const startBtn = document.getElementById('startBtn');

    if (exerciseModalOverlay) {
      exerciseModalOverlay.addEventListener('click', (e) => {
        if (e.target === exerciseModalOverlay) {
          this.closeExerciseModal();
        }
      });
    }

    if (closeExerciseModalBtn) {
      closeExerciseModalBtn.addEventListener('click', () => {
        this.closeExerciseModal();
      });
    }

    if (startExerciseBtn) {
      startExerciseBtn.addEventListener('click', () => {
        const selectedMeal = this.model.getSelectedMeal();
        if (selectedMeal && !selectedMeal.completed) {
          this.presenter.handleStartExercise(selectedMeal);
        }
      });
    }

    if (saveExerciseBtn) {
      saveExerciseBtn.addEventListener('click', () => {
        this.presenter.handleSaveExercise();
        this.closeExerciseModal();
      });
    }

    if (decreaseDurationBtn) {
      decreaseDurationBtn.addEventListener('click', () => {
        const selectedMeal = this.model.getSelectedMeal();
        if (selectedMeal && !selectedMeal.completed) {
          const newDuration = Math.max(10, this.model.getCurrentDuration() - 10);
          this.presenter.handleDurationChange(newDuration);
        }
      });
    }

    if (increaseDurationBtn) {
      increaseDurationBtn.addEventListener('click', () => {
        const selectedMeal = this.model.getSelectedMeal();
        if (selectedMeal && !selectedMeal.completed) {
          const newDuration = Math.min(86400, this.model.getCurrentDuration() + 10);
          this.presenter.handleDurationChange(newDuration);
        }
      });
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (startBtn.textContent === '|| Jeda') {
          this.presenter.pauseTimer();
        } else if (startBtn.textContent === 'Lanjut') {
          this.presenter.resumeTimer();
        } else if (startBtn.textContent === 'Selesai') {
          this.presenter.handleCompleteExercise();
          this.closeExerciseModal();
        }
      });
    }
  }

  openModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  async openCameraModal() {
    this.closeModal();
    const cameraModalOverlay = document.getElementById('cameraModalOverlay');
    if (cameraModalOverlay) {
      cameraModalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('cameraPreview');
        video.srcObject = stream;
        video.style.display = 'block';
        this.cameraStream = stream;
      } catch (err) {
        console.error('Error accessing camera:', err);
        this.showMessage('Tidak dapat mengakses kamera. Periksa izin kamera.', 'error');
        this.closeCameraModal();
      }
    }
  }

  closeCameraModal() {
    const cameraModalOverlay = document.getElementById('cameraModalOverlay');
    if (cameraModalOverlay) {
      cameraModalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';

      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => track.stop());
        this.cameraStream = null;
      }

      const video = document.getElementById('cameraPreview');
      const capturedImage = document.getElementById('capturedImage');
      const captureBtn = document.getElementById('captureBtn');

      if (video) {
        video.srcObject = null;
        video.style.display = 'none';
      }
      if (capturedImage) {
        capturedImage.style.display = 'none';
        capturedImage.src = '';
      }
      if (captureBtn) {
        captureBtn.style.display = 'block';
      }

      document.getElementById('mealDuration').value = '10';
      document.getElementById('durationUnit').value = 'seconds';
    }
  }

  captureImage() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('cameraCanvas');
    const capturedImage = document.getElementById('capturedImage');
    const captureBtn = document.getElementById('captureBtn');

    if (video && canvas && capturedImage) {
      try {
        // **FIX 7: Improved image capture with better quality control**
        const maxWidth = 400;
        const maxHeight = 400;
        
        let { videoWidth, videoHeight } = video;
        
        // Calculate proportional size
        if (videoWidth > maxWidth) {
          videoHeight = (videoHeight * maxWidth) / videoWidth;
          videoWidth = maxWidth;
        }
        if (videoHeight > maxHeight) {
          videoWidth = (videoWidth * maxHeight) / videoHeight;
          videoHeight = maxHeight;
        }
        
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas first
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        
        // Draw image
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        
        // Generate clean base64 dengan quality yang pas
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        
        // Validate generated base64
        if (!dataURL || !dataURL.startsWith('data:image/jpeg;base64,')) {
          throw new Error('Failed to generate valid base64');
        }
        
        console.log('📸 Image captured successfully:', {
          dimensions: `${videoWidth}x${videoHeight}`,
          size: (dataURL.length / 1024).toFixed(2) + ' KB',
          format: 'JPEG 80% quality',
          isValid: dataURL.length > 1000 // Basic validation
        });
        
        capturedImage.src = dataURL;
        capturedImage.style.display = 'block';
        video.style.display = 'none';
        captureBtn.style.display = 'none';

        // Stop camera
        if (this.cameraStream) {
          this.cameraStream.getTracks().forEach(track => track.stop());
          this.cameraStream = null;
          video.srcObject = null;
        }
        
      } catch (error) {
        console.error('❌ Error capturing image:', error);
        this.showMessage('Gagal mengambil gambar. Coba lagi.', 'error');
      }
    }
  }

  openGalleryModal() {
    this.closeModal();
    const galleryModalOverlay = document.getElementById('galleryModalOverlay');
    if (galleryModalOverlay) {
      galleryModalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeGalleryModal() {
    const galleryModalOverlay = document.getElementById('galleryModalOverlay');
    if (galleryModalOverlay) {
      galleryModalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';

      document.getElementById('galleryInput').value = '';
      document.getElementById('galleryPreview').src = '';
      document.getElementById('galleryPreview').style.display = 'none';
      document.getElementById('galleryMealDuration').value = '10';
      document.getElementById('galleryDurationUnit').value = 'seconds';
    }
  }

  openExerciseModal(meal) {
    this.model.setSelectedMeal(meal);
    this.model.setCurrentDuration(Math.max(10, parseInt(meal.description.split(' ')[1]) || 10));

    const modal = document.getElementById('exerciseModalOverlay');
    const title = document.getElementById('exerciseModalTitle');
    const image = document.getElementById('exerciseModalImage');
    const options = document.getElementById('exerciseOptions');
    const durationCounter = document.getElementById('durationCounter');
    const completedStatus = document.getElementById('completedStatus');

    this.resetExerciseModalState();

    if (title) title.textContent = meal.name.toUpperCase();
    if (image) image.src = meal.image;

    this.updateExerciseDisplay(this.model.getCurrentDuration(), meal.calories);

    if (meal.completed) {
      if (options) options.style.display = 'none';
      if (durationCounter) durationCounter.style.display = 'none';
      if (completedStatus) completedStatus.style.display = 'block';
    } else {
      if (options) options.style.display = 'flex';
      if (durationCounter) durationCounter.style.display = 'flex';
      if (completedStatus) completedStatus.style.display = 'none';
    }

    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeExerciseModal() {
    const modal = document.getElementById('exerciseModalOverlay');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
    this.presenter.cleanup();
  }

  resetExerciseModalState() {
    const elements = {
      options: document.getElementById('exerciseOptions'),
      loading: document.getElementById('loadingIndicator'),
      timer: document.getElementById('exerciseTimer'),
      startBtn: document.getElementById('startBtn'),
      durationCounter: document.getElementById('durationCounter'),
      completedStatus: document.getElementById('completedStatus'),
      prepMessage: document.getElementById('prepMessage')
    };

    if (elements.options) elements.options.style.display = 'flex';
    if (elements.loading) elements.loading.style.display = 'none';
    if (elements.timer) elements.timer.style.display = 'none';
    if (elements.startBtn) {
      elements.startBtn.style.display = 'none';
      elements.startBtn.textContent = '|| Jeda';
    }
    if (elements.durationCounter) elements.durationCounter.style.display = 'flex';
    if (elements.completedStatus) elements.completedStatus.style.display = 'none';
    if (elements.prepMessage) elements.prepMessage.style.display = 'none';
  }

  closeAllModals() {
    this.closeModal();
    this.closeCameraModal();
    this.closeGalleryModal();
    this.closeExerciseModal();
  }

  selectOption(option) {
    this.showMessage(`${option} dipilih`, 'info');
    this.closeModal();
  }

  updateMealList(meals) {
    const mealList = document.getElementById('meal-list');
    const noMeals = document.getElementById('no-meals');
    const mealSuggestion = document.getElementById('meal-suggestion');

    if (meals.length > 0) {
      if (noMeals) noMeals.style.display = 'none';
      if (mealSuggestion) mealSuggestion.style.display = 'none';
      if (mealList) {
        mealList.innerHTML = '';

        meals.forEach(meal => {
          const mealItem = document.createElement('div');
          mealItem.className = `meal-item ${meal.analyzing ? 'analyzing analyzing-pulse' : ''}`;
          mealItem.setAttribute('data-meal-id', meal.id);
          
          // **FIX 8: Better image handling with error fallback**
          const createImageElement = (src, className, altText = 'Exercise Image') => {
            const defaultImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+V29ya291dDwvdGV4dD48dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
            
            return `<img src="${src || defaultImg}" 
                        class="${className}" 
                        alt="${altText}"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='${defaultImg}'; console.log('❌ Image failed to load for ${meal.name}, using fallback');"
                        onload="console.log('✅ Image loaded for ${meal.name}');">`;
          };
          
          if (meal.analyzing) {
            mealItem.innerHTML = `
              ${createImageElement(meal.image, 'meal-image', 'Analyzing...')}
              <div class="meal-info">
                <div class="meal-name analyzing-text">Analyzing<span class="analyzing-dots"></span></div>
                <div class="meal-nutrition">Sedang menganalisis gambar...</div>
                <div class="analyzing-progress">
                  <div class="analyzing-progress-bar"></div>
                </div>
              </div>
              <div class="analyzing-status">
                <div class="analyzing-spinner"></div>
                <span>Processing</span>
              </div>
            `;
          } else {
            mealItem.innerHTML = `
              ${createImageElement(meal.image, 'meal-image', meal.name)}
              <div class="meal-info">
                <div class="meal-name">${meal.name}</div>
                <div class="meal-nutrition">${meal.calories} kkal${meal.description ? ' - ' + meal.description : ''}</div>
              </div>
              <div class="meal-status">${meal.completed ? '<i class="fas fa-check"></i> Selesai' : ''}</div>
              <div class="meal-actions">
                <button class="meal-action-btn delete-meal-btn" data-meal-id="${meal.id}">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `;

            // Event listeners
            mealItem.addEventListener('click', (e) => {
              if (!e.target.closest('.delete-meal-btn')) {
                this.openExerciseModal(meal);
              }
            });

            const deleteBtn = mealItem.querySelector('.delete-meal-btn');
            if (deleteBtn) {
              deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeleteMeal(meal.id);
              });
            }
          }

          mealList.appendChild(mealItem);
        });
      }
    } else {
      if (noMeals) noMeals.style.display = 'block';
      if (mealSuggestion) mealSuggestion.style.display = 'block';
      if (mealList) mealList.innerHTML = '';
    }
  }

  updateCaloriesDisplay(totalBurned) {
    const targetCalories = this.presenter.getTargetCalories();
    const caloriesRemaining = targetCalories - totalBurned;

    const calorieProgress = document.getElementById('calorieProgress');
    const caloriesBurned = document.getElementById('caloriesBurned');
    const progressRing = document.querySelector('.progress-ring');

    if (calorieProgress) {
      calorieProgress.textContent = `${totalBurned}/${targetCalories}`;
    }
    if (caloriesBurned) {
      caloriesBurned.textContent = `${totalBurned} kkal`;
    }
    if (progressRing) {
      const progressPercentage = (totalBurned / targetCalories) * 360;
      progressRing.style.background = `conic-gradient(#ff6b6b ${progressPercentage}deg, rgba(255, 255, 255, 0.1) ${progressPercentage}deg)`;
    }
  }

  updateExerciseDisplay(duration, calories) {
    const durationValue = document.getElementById('exerciseDuration');
    const durationDisplay = document.getElementById('exerciseModalDuration');
    const caloriesDisplay = document.getElementById('exerciseModalCalories');

    if (durationValue) {
      durationValue.textContent = this.presenter.formatDuration(duration);
    }
    if (durationDisplay) {
      durationDisplay.textContent = `Durasi: ${this.presenter.formatDuration(duration)}`;
    }
    if (caloriesDisplay) {
      caloriesDisplay.textContent = `Kalori: ${calories} kkal`;
    }
  }

  updateTimerDisplay(timeLeft) {
    const timer = document.getElementById('exerciseTimer');
    if (timer) {
      timer.textContent = this.presenter.formatDuration(timeLeft);
    }
  }

  showExercisePreparation(meal) {
    const elements = {
      options: document.getElementById('exerciseOptions'),
      loading: document.getElementById('loadingIndicator'),
      timer: document.getElementById('exerciseTimer'),
      startBtn: document.getElementById('startBtn'),
      durationCounter: document.getElementById('durationCounter'),
      prepMessage: document.getElementById('prepMessage')
    };

    if (elements.options) elements.options.style.display = 'none';
    if (elements.loading) elements.loading.style.display = 'block';
    if (elements.timer) elements.timer.style.display = 'none';
    if (elements.startBtn) elements.startBtn.style.display = 'none';
    if (elements.durationCounter) elements.durationCounter.style.display = 'none';
    if (elements.prepMessage) {
      elements.prepMessage.style.display = 'block';
      elements.prepMessage.textContent = `Persiapan melakukan gerakan: ${meal.name}`;
    }
  }

  showExerciseTimer() {
    const elements = {
      loading: document.getElementById('loadingIndicator'),
      prepMessage: document.getElementById('prepMessage'),
      timer: document.getElementById('exerciseTimer'),
      startBtn: document.getElementById('startBtn')
    };

    if (elements.loading) elements.loading.style.display = 'none';
    if (elements.prepMessage) elements.prepMessage.style.display = 'none';
    if (elements.timer) elements.timer.style.display = 'block';
    if (elements.startBtn) {
      elements.startBtn.style.display = 'block';
      elements.startBtn.textContent = '|| Jeda';
    }
  }

  showExerciseComplete() {
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.textContent = 'Selesai';
    }
  }

  showTimerPaused() {
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.textContent = 'Lanjut';
    }
  }

  showTimerRunning() {
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.textContent = '|| Jeda';
    }
  }

  handleDeleteMeal(id) {
    this.presenter.handleDeleteMeal(id);
  }

  showMessage(message, type = 'info') {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 4000);
  }
}

window.homePage = null;