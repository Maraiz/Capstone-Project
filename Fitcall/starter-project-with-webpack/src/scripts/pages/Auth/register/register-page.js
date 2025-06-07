import RegisterPresenter from './register-presenter.js';

export default class RegisterPage {
  constructor() {
    this.currentStep = 1;
    this.maxStep = 7;
    this.presenter = null;
    this.presenter = new RegisterPresenter(this);
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  setCurrentStep(step) {
    this.currentStep = step;
  }

  // ================================
  // RENDER METHODS
  // ================================

  async render() {
    switch (this.currentStep) {
      case 1: return this.renderStep1();
      case 2: return this.renderStep2();
      case 3: return this.renderStep3();
      case 4: return this.renderStep4();
      case 5: return this.renderStep5();
      case 6: return this.renderStep6();
      case 7: return this.renderStep7();
      default: return this.renderStep1();
    }
  }

  async afterRender() {
    this.bindEvents();
    await this.presenter.initialize();
  }

  renderStep1() {
    return `
      <div class="container register-container">
        <h1 class="title">Selamat Datang</h1>
        
        <div class="form-section">
          <h2 class="question">Pertama-tama, siapa nama panggilanmu?</h2>
          
          <div class="input-group">
            <label class="input-label">Masukkan Namamu Disini</label>
            <input type="text" id="nameInput" class="input-field" placeholder="" maxlength="50">
            <div class="form-error">Nama minimal 2 karakter dan maksimal 50 karakter</div>
          </div>
        </div>
        
        <div class="button-container">
          <button class="btn btn-back" id="backBtn">
            <span class="arrow-left">←</span>
          </button>
          <button class="btn btn-primary" id="nextBtn" disabled>Berikutnya</button>
        </div>
      </div>
    `;
  }

  renderStep2() {
    const countries = this.presenter.getCountries();
    const countryOptions = countries.map(country =>
      `<option value="${country.value}">${country.label}</option>`
    ).join('');

    return `
      <div class="container register-container register-step2">
        <h1 class="title">Selamat Datang</h1>
        
        <div class="content">
          <div class="left-section">
            <h2 class="section-title">Beri tahu kami sedikit tentang diri Anda</h2>
            
            <div class="input-group">
              <label class="input-label">Anda Tinggal Dimana</label>
              <select class="dropdown" id="countrySelect">
                <option value="">Pilih Negara</option>
                ${countryOptions}
              </select>
              <div class="form-error">Mohon pilih negara tempat tinggal</div>
            </div>
          </div>
          
          <div class="right-section">
            <div class="input-group">
              <label class="input-label">Pilih jenis kelamin yang akan kami gunakan untuk kebutuhan kalorimu</label>
              
              <div class="gender-options">
                <div class="gender-option" data-gender="male" id="genderMale">
                  <span>Pria</span>
                  <div class="radio-circle"></div>
                </div>
                <div class="gender-option" data-gender="female" id="genderFemale">
                  <span>Wanita</span>
                  <div class="radio-circle"></div>
                </div>
              </div>
              <div class="form-error">Mohon pilih jenis kelamin</div>
            </div>
            
            <div class="input-group age-section">
              <label class="input-label">Berapa Usiamu?</label>
              <input type="number" class="age-input" id="ageInput" placeholder="Masukkan usia" min="13" max="100">
              <div class="form-error">Usia minimal 13 tahun dan maksimal 100 tahun</div>
              <p class="age-description">Kami menggunakan jenis kelamin saat lahir dan usia untuk menghitung tujuan yang akurat untuk anda.</p>
            </div>
          </div>
        </div>
        
        <div class="button-container">
          <button class="btn btn-back" id="backBtn">
            <span class="arrow-left">←</span>
          </button>
          <button class="btn btn-primary" id="nextBtn" disabled>Berikutnya</button>
        </div>
      </div>
    `;
  }

  renderStep3() {
    return `
      <div class="container register-container register-step3">
        <h1 class="title">Selamat Datang</h1>
        
        <div class="content">
          <div class="left-section">
            <h2 class="section-title">Beri tahu kami sedikit tentang diri Anda</h2>
            
            <div class="input-group">
              <label class="input-label">Berapa sasaran berat badanmu?</label>
              <div class="input-with-unit">
                <input type="number" class="input-field" id="targetWeightInput" placeholder="Masukkan berat target" min="30" max="200" step="0.1">
                <div class="unit-label">kg</div>
              </div>
              <p class="input-description">(Opsional) Ini tidak mempengaruhi sasaran kalori harianmu dan dapat diubah nanti atau jangan di isi</p>
              <div class="form-error">Target berat badan harus antara 30-200 kg</div>
            </div>
          </div>
          
          <div class="right-section">
            <div class="input-group">
              <label class="input-label">Berapa Tinggi Badanmu?</label>
              <div class="input-with-unit">
                <input type="number" class="input-field" id="heightInput" placeholder="Masukkan tinggi badan" min="100" max="250">
                <div class="unit-label">cm</div>
              </div>
              <div class="form-error">Tinggi badan harus antara 100-250 cm</div>
            </div>

            <div class="input-group">
              <label class="input-label">Berapa Berat Badanmu?</label>
              <div class="input-with-unit">
                <input type="number" class="input-field" id="currentWeightInput" placeholder="Masukkan berat badan" min="30" max="300" step="0.1">
                <div class="unit-label">kg</div>
              </div>
              <div class="form-error">Berat badan harus antara 30-300 kg</div>
            </div>
          </div>
        </div>
        
        <div class="button-container">
          <button class="btn btn-back" id="backBtn">
            <span class="arrow-left">←</span>
          </button>
          <button class="btn btn-primary" id="nextBtn" disabled>Berikutnya</button>
        </div>
      </div>
    `;
  }

  renderStep4() {
    const weeklyTargets = this.presenter.getWeeklyTargets();
    const targetOptions = weeklyTargets.map(target => `
      <label class="radio-option">
        <input type="radio" name="target" value="${target.value}" id="target${target.value.replace('.', '')}">
        <span class="radio-text">${target.label}</span>
        <span class="radio-circle"></span>
      </label>
    `).join('');

    return `
      <div class="container register-container register-step4">
        <h1 class="title">Selamat Datang</h1>
        
        <div class="form-container">
          <div class="left-section">
            <h2 class="section-title">Apa sasaran mingguanmu</h2>
            <p class="subtitle">Pilih Satu</p>
            
            <div class="input-group">
              <div class="radio-group">
                ${targetOptions}
              </div>
              <div class="form-error">Mohon pilih sasaran mingguan</div>
            </div>
          </div>
          
          <div class="right-section">
            <h2 class="section-title">Batas waktu Sasaran</h2>
            
            <div class="input-group">
              <div class="date-input-container">
                <input type="date" class="date-input" id="targetDeadlineInput" min="${this.presenter.getTodayDateString()}">
              </div>
              <div class="form-error">Mohon pilih batas waktu sasaran</div>
            </div>
          </div>
        </div>
        
        <div class="button-container">
          <button class="btn btn-back" id="backBtn">
            <span class="arrow-left">←</span>
          </button>
          <button class="btn btn-primary" id="nextBtn" disabled>Berikutnya</button>
        </div>
      </div>
    `;
  }

  renderStep5() {
    const activityLevels = this.presenter.getActivityLevels();
    const activityOptions = activityLevels.map((activity, index) => `
      <label class="activity-option">
        <input type="radio" name="activity" value="${activity.value}" id="activity${index}">
        <div class="activity-card">
          <h3>${activity.title}</h3>
          <p>${activity.description}</p>
          <span class="activity-level">${activity.multiplier}</span>
        </div>
        <span class="radio-circle"></span>
      </label>
    `).join('');

    return `
      <div class="container register-container register-step5">
        <h1 class="title">Tingkat Aktivitas Harian</h1>
        
        <div class="form-container">
          <div class="activity-section">
            <h2 class="section-title">Pilih tingkat aktivitas yang paling sesuai dengan rutinmu</h2>
            <p class="subtitle">Ini akan membantu kami menghitung kebutuhan kalori harianmu</p>
            
            <div class="input-group">
              <div class="activity-options">
                ${activityOptions}
              </div>
              <div class="form-error">Mohon pilih tingkat aktivitas</div>
            </div>
          </div>
        </div>
        
        <div class="button-container">
          <button class="btn btn-back" id="backBtn">
            <span class="arrow-left">←</span>
          </button>
          <button class="btn btn-primary" id="nextBtn" disabled>Hitung Kalori</button>
        </div>
      </div>
    `;
  }

  renderStep6() {
    const calculationResults = this.presenter.getCalorieCalculation();
    const data = this.presenter.getRegistrationData();
    
    return `
      <div class="container register-container register-step6">
        <div class="calorie-result-page">
          
          <div class="calorie-circle-container">
            <div class="calorie-circle">
              <div class="calorie-number">${calculationResults.targetCalories}</div>
              <div class="calorie-label">Kcal per hari</div>
            </div>
          </div>
          
          <div class="result-description">
            <p>Saya akan membantu Anda mencapai tujuan <strong>${data.targetWeight ? data.targetWeight + ' Kg' : 'berat ideal'}</strong> dengan memastikan Anda mengonsumsi <strong>${calculationResults.targetCalories} kcal</strong> setiap hari</p>
          </div>
          
          <div class="result-action">
            <button class="btn btn-primary btn-large" id="continueBtn">Lanjutkan</button>
          </div>
          
          <div class="detail-toggle">
            <button class="btn-link" id="showDetailsBtn">Lihat Detail Kalkulasi</button>
          </div>
          
          <div class="detailed-breakdown" id="detailedBreakdown" style="display: none;">
            <div class="breakdown-grid">
              <div class="breakdown-item">
                <div class="breakdown-label">BMR (Metabolisme Dasar)</div>
                <div class="breakdown-value">${calculationResults.bmr} kcal</div>
              </div>
              <div class="breakdown-item">
                <div class="breakdown-label">TDEE (Total Kebutuhan)</div>
                <div class="breakdown-value">${calculationResults.tdee} kcal</div>
              </div>
              <div class="breakdown-item">
                <div class="breakdown-label">Target Penurunan</div>
                <div class="breakdown-value">${data.weeklyTarget} kg/minggu</div>
              </div>
              <div class="breakdown-item">
                <div class="breakdown-label">Defisit Harian</div>
                <div class="breakdown-value">${calculationResults.dailyDeficit} kcal</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    `;
  }

  renderStep7() {
    return `
      <div class="container register-container register-step7">
        <h1 class="title">Buat Akun</h1>
        
        <div class="form-section">
          <h2 class="question">Langkah terakhir, buat akun untuk menyimpan progresmu</h2>
          
          <div class="input-group">
            <label class="input-label">Username</label>
            <input type="text" id="usernameInput" class="input-field" placeholder="Masukkan username" maxlength="20">
            <div class="input-description">Username hanya boleh mengandung huruf, angka, dan underscore (_)</div>
            <div class="form-error">Username minimal 3 karakter dan maksimal 20 karakter</div>
          </div>
          
          <div class="input-group">
            <label class="input-label">Email</label>
            <input type="email" id="emailInput" class="input-field" placeholder="Masukkan email">
            <div class="form-error">Format email tidak valid</div>
          </div>
          
          <div class="input-group">
            <label class="input-label">Password</label>
            <div class="password-input-container">
              <input type="password" id="passwordInput" class="input-field password-field" placeholder="Masukkan password" maxlength="50">
              <button type="button" class="password-toggle" id="passwordToggle">
                <span class="eye-icon">👁️</span>
              </button>
            </div>
            <div class="input-description">Password minimal 6 karakter</div>
            <div class="form-error">Password minimal 6 karakter dan maksimal 50 karakter</div>
          </div>
          
          <div class="input-group">
            <label class="input-label">Konfirmasi Password</label>
            <div class="password-input-container">
              <input type="password" id="confirmPasswordInput" class="input-field password-field" placeholder="Ulangi password" maxlength="50">
              <button type="button" class="password-toggle" id="confirmPasswordToggle">
                <span class="eye-icon">👁️</span>
              </button>
            </div>
            <div class="form-error">Konfirmasi password tidak sesuai</div>
          </div>
        </div>
        
        <div class="button-container">
          <button class="btn btn-back" id="backBtn">
            <span class="arrow-left">←</span>
          </button>
          <button class="btn btn-primary" id="nextBtn" disabled>
            <span class="btn-text">Buat Akun</span>
            <span class="btn-loading" style="display: none;">⏳ Memproses...</span>
          </button>
        </div>
      </div>
    `;
  }

  // ================================
  // EVENT BINDING - SAME AS BEFORE
  // ================================

  bindEvents() {
    switch (this.currentStep) {
      case 1: this.bindStep1Events(); break;
      case 2: this.bindStep2Events(); break;
      case 3: this.bindStep3Events(); break;
      case 4: this.bindStep4Events(); break;
      case 5: this.bindStep5Events(); break;
      case 6: this.bindStep6Events(); break;
      case 7: this.bindStep7Events(); break;
    }
  }

  bindStep1Events() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const nameInput = document.getElementById('nameInput');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.presenter.handleBackButton(1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.presenter.handleNextButton(1);
      });
    }

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        this.presenter.handleFieldChange('name', nameInput.value);
      });

      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !nextBtn.disabled) {
          this.presenter.handleNextButton(1);
        }
      });

      setTimeout(() => nameInput.focus(), 100);
    }
  }

  bindStep2Events() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const countrySelect = document.getElementById('countrySelect');
    const genderOptions = document.querySelectorAll('.gender-option');
    const ageInput = document.getElementById('ageInput');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.presenter.handleBackButton(2);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.presenter.handleNextButton(2);
      });
    }

    if (countrySelect) {
      countrySelect.addEventListener('change', () => {
        this.presenter.handleFieldChange('country', countrySelect.value);
      });
    }

    genderOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.presenter.handleGenderSelection(option.dataset.gender);
      });
    });

    if (ageInput) {
      ageInput.addEventListener('input', () => {
        this.presenter.handleFieldChange('age', ageInput.value);
      });

      ageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !nextBtn.disabled) {
          this.presenter.handleNextButton(2);
        }
      });
    }
  }

  bindStep3Events() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const targetWeightInput = document.getElementById('targetWeightInput');
    const heightInput = document.getElementById('heightInput');
    const currentWeightInput = document.getElementById('currentWeightInput');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.presenter.handleBackButton(3);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.presenter.handleNextButton(3);
      });
    }

    [targetWeightInput, heightInput, currentWeightInput].forEach(input => {
      if (input) {
        const field = input.id.replace('Input', '');
        input.addEventListener('input', () => {
          this.presenter.handleFieldChange(field, input.value);
        });

        if (input === currentWeightInput) {
          input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !nextBtn.disabled) {
              this.presenter.handleNextButton(3);
            }
          });
        }
      }
    });
  }

  bindStep4Events() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const radioButtons = document.querySelectorAll('input[name="target"]');
    const dateInput = document.getElementById('targetDeadlineInput');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.presenter.handleBackButton(4);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.presenter.handleNextButton(4);
      });
    }

    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => {
        this.presenter.handleRadioSelection('weeklyTarget', radio.value);
      });
    });

    if (dateInput) {
      dateInput.addEventListener('change', () => {
        this.presenter.handleFieldChange('targetDeadline', dateInput.value);
      });

      dateInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !nextBtn.disabled) {
          this.presenter.handleNextButton(4);
        }
      });
    }
  }

  bindStep5Events() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const radioButtons = document.querySelectorAll('input[name="activity"]');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.presenter.handleBackButton(5);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.presenter.handleNextButton(5);
      });
    }

    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => {
        this.presenter.handleRadioSelection('activityLevel', radio.value);
      });
    });
  }

  bindStep6Events() {
    const continueBtn = document.getElementById('continueBtn');
    const showDetailsBtn = document.getElementById('showDetailsBtn');

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.presenter.handleContinueToAccount();
      });

      setTimeout(() => continueBtn.focus(), 500);
    }

    if (showDetailsBtn) {
      showDetailsBtn.addEventListener('click', () => {
        this.presenter.handleDetailToggle();
      });
    }
  }

  bindStep7Events() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const usernameInput = document.getElementById('usernameInput');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.presenter.handleBackButton(7);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.presenter.handleNextButton(7);
      });
    }

    if (usernameInput) {
      usernameInput.addEventListener('input', () => {
        this.presenter.handleFieldChange('username', usernameInput.value);
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        this.presenter.handleFieldChange('email', emailInput.value);
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        this.presenter.handleFieldChange('password', passwordInput.value);
      });
    }

    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        this.presenter.handleFieldChange('confirmPassword', confirmPasswordInput.value);
      });

      confirmPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !nextBtn.disabled) {
          this.presenter.handleNextButton(7);
        }
      });
    }

    if (passwordToggle && passwordInput) {
      passwordToggle.addEventListener('click', () => {
        this.togglePasswordVisibility(passwordInput, passwordToggle);
      });
    }

    if (confirmPasswordToggle && confirmPasswordInput) {
      confirmPasswordToggle.addEventListener('click', () => {
        this.togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggle);
      });
    }

    setTimeout(() => {
      if (usernameInput) usernameInput.focus();
    }, 100);
  }

  // ================================
  // UI UPDATE METHODS
  // ================================

  updateFormValidation(field, validation) {
    const input = document.getElementById(field + 'Input') ||
      document.getElementById(field + 'Select') ||
      document.querySelector(`[data-field="${field}"]`);

    if (!input) return;

    const inputGroup = input.closest('.input-group');

    if (inputGroup) {
      if (validation.valid) {
        inputGroup.classList.remove('error');
        input.classList.remove('invalid');
        input.classList.add('valid');
      } else {
        inputGroup.classList.add('error');
        input.classList.add('invalid');
        input.classList.remove('valid');
      }
    }
  }

  updateButtonState(stepNumber, isValid) {
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.disabled = !isValid;
      nextBtn.style.opacity = isValid ? '1' : '0.5';
    }
  }

  selectGender(genderValue) {
    document.querySelectorAll('.gender-option').forEach(option => {
      option.classList.remove('selected');
    });

    const selectedOption = document.querySelector(`[data-gender="${genderValue}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
  }

  toggleDetailBreakdown() {
    const detailedBreakdown = document.getElementById('detailedBreakdown');
    const showDetailsBtn = document.getElementById('showDetailsBtn');

    if (detailedBreakdown && showDetailsBtn) {
      const isHidden = detailedBreakdown.style.display === 'none';

      if (isHidden) {
        detailedBreakdown.style.display = 'block';
        showDetailsBtn.textContent = 'Sembunyikan Detail';
      } else {
        detailedBreakdown.style.display = 'none';
        showDetailsBtn.textContent = 'Lihat Detail Kalkulasi';
      }
    }
  }

  togglePasswordVisibility(input, toggleBtn) {
    const eyeIcon = toggleBtn.querySelector('.eye-icon');
    
    if (input.type === 'password') {
      input.type = 'text';
      eyeIcon.textContent = '🙈';
      toggleBtn.setAttribute('aria-label', 'Sembunyikan password');
    } else {
      input.type = 'password';
      eyeIcon.textContent = '👁️';
      toggleBtn.setAttribute('aria-label', 'Tampilkan password');
    }
  }

  showMessage(message, type = 'info') {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    Object.assign(messageDiv.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });

    switch (type) {
      case 'success':
        messageDiv.style.backgroundColor = '#28a745';
        break;
      case 'error':
        messageDiv.style.backgroundColor = '#dc3545';
        break;
      case 'warning':
        messageDiv.style.backgroundColor = '#ffc107';
        messageDiv.style.color = '#000';
        break;
      default:
        messageDiv.style.backgroundColor = '#007AFF';
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }

  async reRender() {
    const container = document.querySelector('main') || document.querySelector('#app') || document.body;
    const newContent = await this.render();
    container.innerHTML = newContent;
    this.bindEvents();
  }
}