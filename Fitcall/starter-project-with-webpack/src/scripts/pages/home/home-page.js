// home-page.js
import HomePresenter from './home-presenter.js';
import HomeModel from './home-model.js';

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
    this.model = new HomeModel();
    this.cameraStream = null;
    
    // ✅ Set global reference untuk event handlers
    window.homePage = this;
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

    // ✅ UBAH: Get user data from API (async)
    const userData = await this.model.getUserData();
    
    // ✅ Handle jika gagal ambil data user
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

    // ✅ Tampilkan target calories dari database
    const targetCalories = userData?.targetCalories || 500;

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
            <h3 class="modal-title">Add Meal</h3>
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
                <div class="modal-option-text">Camera</div>
              </div>
              <div class="modal-option" id="galleryOption">
                <div class="modal-option-icon album">
                  <i class="fas fa-images"></i>
                </div>
                <div class="modal-option-text">Album</div>
              </div>
              <div class="modal-option" id="favoriteOption">
                <div class="modal-option-icon favorite">
                  <i class="fas fa-heart"></i>
                </div>
                <div class="modal-option-text">Favorite</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Camera Modal -->
      <div class="modal-overlay" id="cameraModalOverlay">
        <div class="camera-modal">
          <div class="modal-header">
            <h3 class="modal-title">Capture Meal</h3>
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
            <button id="captureBtn">Capture</button>
            <button id="saveMealBtn">Save</button>
          </div>
        </div>
      </div>

      <!-- Gallery Modal -->
      <div class="modal-overlay" id="galleryModalOverlay">
        <div class="camera-modal">
          <div class="modal-header">
            <h3 class="modal-title">Select from Gallery</h3>
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
            <button id="saveGalleryMealBtn">Save</button>
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
          <div class="completed-status" id="completedStatus">Completed</div>
          <div class="prep-message" id="prepMessage"></div>
        </div>
      </div>
    `;
  }

// home-page.js
async afterRender() {
  // Only initialize event listeners for authenticated users
  if (this.model.getToken()) {
    // ✅ TAMBAHKAN: Set target calories ke model sebelum update display
    const userData = await this.model.getUserData();
    if (userData) {
      const targetCalories = userData?.targetCalories || 500;
      this.presenter.setTargetCalories(targetCalories);
    }
    
    this.initializeEventListeners();
    // Initialize calories display
    this.presenter.updateCaloriesDisplay();
  }
  // Always check auth state to trigger redirect if needed
  this.presenter.checkAuthState();
}

  initializeEventListeners() {
    // Existing event listeners
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

    // New event listeners for modals and buttons
    this.initializeModalEventListeners();
    this.initializeCameraEventListeners();
    this.initializeGalleryEventListeners();
    this.initializeExerciseEventListeners();

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeAllModals();
      }
    });

    setTimeout(() => {
      const progressFill = document.querySelector('.progress-fill');
      if (progressFill) {
        progressFill.style.width = '0%';
      }
    }, 500);
  }

  initializeModalEventListeners() {
    // Add button event listener
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openModal();
      });
    }

    // Main modal event listeners
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

    // Modal option event listeners
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
      saveMealBtn.addEventListener('click', async () => {
        const duration = parseInt(document.getElementById('mealDuration').value) || 0;
        const unit = document.getElementById('durationUnit').value;
        const capturedImage = document.getElementById('capturedImage');
        
        const success = await this.presenter.handleCameraCapture(duration, unit, capturedImage.src);
        if (success) {
          this.closeCameraModal();
        }
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
      saveGalleryMealBtn.addEventListener('click', async () => {
        const duration = parseInt(document.getElementById('galleryMealDuration').value) || 0;
        const unit = document.getElementById('galleryDurationUnit').value;
        const galleryPreview = document.getElementById('galleryPreview');
        
        const success = await this.presenter.handleGalleryUpload(duration, unit, galleryPreview.src);
        if (success) {
          this.closeGalleryModal();
        }
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
        const selectedMeal = this.presenter.model.getSelectedMeal();
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
        const selectedMeal = this.presenter.model.getSelectedMeal();
        if (selectedMeal && !selectedMeal.completed) {
          const newDuration = Math.max(10, this.presenter.model.getCurrentDuration() - 10);
          this.presenter.handleDurationChange(newDuration);
        }
      });
    }

    if (increaseDurationBtn) {
      increaseDurationBtn.addEventListener('click', () => {
        const selectedMeal = this.presenter.model.getSelectedMeal();
        if (selectedMeal && !selectedMeal.completed) {
          const newDuration = Math.min(86400, this.presenter.model.getCurrentDuration() + 10);
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

  // Modal operations
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
        this.showMessage('Could not access camera. Please check permissions.', 'error');
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

      // Reset form
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      capturedImage.src = canvas.toDataURL('image/jpeg');
      capturedImage.style.display = 'block';
      video.style.display = 'none';
      captureBtn.style.display = 'none';

      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => track.stop());
        this.cameraStream = null;
        video.srcObject = null;
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

      // Reset form
      document.getElementById('galleryInput').value = '';
      document.getElementById('galleryPreview').src = '';
      document.getElementById('galleryPreview').style.display = 'none';
      document.getElementById('galleryMealDuration').value = '10';
      document.getElementById('galleryDurationUnit').value = 'seconds';
    }
  }

  openExerciseModal(meal) {
    this.presenter.model.setSelectedMeal(meal);
    this.presenter.model.setCurrentDuration(Math.max(10, parseInt(meal.description.split(' ')[1]) || 10));

    const modal = document.getElementById('exerciseModalOverlay');
    const title = document.getElementById('exerciseModalTitle');
    const image = document.getElementById('exerciseModalImage');
    const options = document.getElementById('exerciseOptions');
    const durationCounter = document.getElementById('durationCounter');
    const completedStatus = document.getElementById('completedStatus');

    // Reset modal state
    this.resetExerciseModalState();

    if (title) title.textContent = meal.name.toUpperCase();
    if (image) image.src = meal.image;

    this.updateExerciseDisplay(this.presenter.model.getCurrentDuration(), meal.calories);

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
    this.showMessage(`${option} option selected`, 'info');
    this.closeModal();
  }

  // Update methods called by presenter
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
          mealItem.className = 'meal-item';
          mealItem.setAttribute('data-meal-id', meal.id);
          mealItem.innerHTML = `
            <img src="${meal.image}" class="meal-image">
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
          
          // ✅ Add event listeners untuk meal item dan delete button
          mealItem.addEventListener('click', (e) => {
            // Jika yang diklik bukan delete button, buka exercise modal
            if (!e.target.closest('.delete-meal-btn')) {
              this.openExerciseModal(meal);
            }
          });

          // Add event listener untuk delete button
          const deleteBtn = mealItem.querySelector('.delete-meal-btn');
          if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
              e.stopPropagation(); // Prevent meal item click
              this.handleDeleteMeal(meal.id);
            });
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

  // Global method for delete meal (called from inline onclick)
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

// Make homePage globally accessible for inline event handlers
window.homePage = null;