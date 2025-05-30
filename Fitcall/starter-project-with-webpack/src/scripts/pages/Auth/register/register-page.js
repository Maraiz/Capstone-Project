export default class RegisterPage {
  constructor() {
    this.app = null;
    this.currentStep = 1;
    this.maxStep = 2; // Will be increased when step 3 is added
    this.registrationData = {
      name: '',
      country: '',
      gender: '',
      age: ''
    };
    
    // Get step from URL hash if available
    this.initializeStep();
  }

  initializeStep() {
    const hash = window.location.hash;
    const stepMatch = hash.match(/step=(\d+)/);
    if (stepMatch) {
      const step = parseInt(stepMatch[1]);
      if (step >= 1 && step <= this.maxStep) {
        this.currentStep = step;
      }
    }
  }

  async render() {
    switch(this.currentStep) {
      case 1:
        return this.renderStep1();
      case 2:
        return this.renderStep2();
      default:
        return this.renderStep1();
    }
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
                <option value="indonesia">Indonesia</option>
                <option value="malaysia">Malaysia</option>
                <option value="singapore">Singapore</option>
                <option value="thailand">Thailand</option>
                <option value="philippines">Philippines</option>
                <option value="vietnam">Vietnam</option>
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

  async afterRender() {
    switch(this.currentStep) {
      case 1:
        this.initializeStep1();
        break;
      case 2:
        this.initializeStep2();
        break;
    }
    this.loadSavedData();
  }

  // STEP 1 METHODS
  initializeStep1() {
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.handleStep1Back();
      });
    }

    // Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.handleStep1Next();
      });
    }

    // Name input validation
    const nameInput = document.getElementById('nameInput');
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        this.validateStep1();
      });

      nameInput.addEventListener('blur', () => {
        this.validateName();
      });

      // Enter key support
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!nextBtn.disabled) {
            this.handleStep1Next();
          }
        }
      });

      // Focus on load
      setTimeout(() => nameInput.focus(), 100);
    }
  }

  validateName() {
    const nameInput = document.getElementById('nameInput');
    const nameGroup = nameInput?.parentElement;
    const name = nameInput?.value?.trim() || '';
    
    // Validation rules
    const isValidLength = name.length >= 2 && name.length <= 50;
    const isValidFormat = /^[a-zA-Z\s]+$/.test(name); // Only letters and spaces
    const isValid = isValidLength && isValidFormat;
    
    if (nameGroup) {
      if (name && !isValid) {
        nameGroup.classList.add('error');
        nameInput.classList.add('invalid');
        nameInput.classList.remove('valid');
      } else if (name && isValid) {
        nameGroup.classList.remove('error');
        nameInput.classList.remove('invalid');
        nameInput.classList.add('valid');
      } else {
        nameGroup.classList.remove('error');
        nameInput.classList.remove('invalid', 'valid');
      }
    }
    
    return isValid;
  }

  validateStep1() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput?.value?.trim() || '';
    const nextBtn = document.getElementById('nextBtn');
    
    const isValid = this.validateName() && name.length >= 2;
    
    if (nextBtn) {
      nextBtn.disabled = !isValid;
      nextBtn.style.opacity = isValid ? '1' : '0.5';
    }

    return isValid;
  }

  handleStep1Back() {
    window.location.hash = '/login';
  }

handleStep1Next() {
  if (!this.validateStep1()) {
    this.showMessage('Mohon masukkan nama yang valid', 'error');
    return;
  }

  // Save data sebelum pindah step
  this.saveCurrentStepData();
  this.showMessage('Data tersimpan! Melanjutkan...', 'success');
  
  setTimeout(() => {
    this.goToStep(2);
  }, 1000);
}

  // STEP 2 METHODS
  initializeStep2() {
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.handleStep2Back();
      });
    }

    // Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.handleStep2Next();
      });
    }

    // Country dropdown
    const countrySelect = document.getElementById('countrySelect');
    if (countrySelect) {
      countrySelect.addEventListener('change', () => {
        this.validateCountry();
        this.validateStep2();
      });
    }

    // Gender options
    const genderOptions = document.querySelectorAll('.gender-option');
    genderOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.selectGender(option);
        this.validateGender();
        this.validateStep2();
      });
    });

    // Age input
    const ageInput = document.getElementById('ageInput');
    if (ageInput) {
      ageInput.addEventListener('input', () => {
        this.validateAge();
        this.validateStep2();
      });

      ageInput.addEventListener('blur', () => {
        this.validateAge();
      });

      // Enter key support
      ageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const nextBtn = document.getElementById('nextBtn');
          if (!nextBtn.disabled) {
            this.handleStep2Next();
          }
        }
      });
    }
  }

  selectGender(element) {
    document.querySelectorAll('.gender-option').forEach(option => {
      option.classList.remove('selected');
    });
    element.classList.add('selected');
  }

  validateCountry() {
    const countrySelect = document.getElementById('countrySelect');
    const countryGroup = countrySelect?.parentElement;
    const country = countrySelect?.value || '';
    
    const isValid = country !== '';
    
    if (countryGroup) {
      if (!isValid && countrySelect.value === '') {
        countryGroup.classList.remove('error');
      } else if (!isValid) {
        countryGroup.classList.add('error');
      } else {
        countryGroup.classList.remove('error');
      }
    }
    
    return isValid;
  }

  validateGender() {
    const selectedGender = document.querySelector('.gender-option.selected');
    const genderGroup = document.querySelector('.gender-options')?.parentElement;
    
    const isValid = selectedGender !== null;
    
    if (genderGroup) {
      if (isValid) {
        genderGroup.classList.remove('error');
      } else {
        genderGroup.classList.add('error');
      }
    }
    
    return isValid;
  }

  validateAge() {
    const ageInput = document.getElementById('ageInput');
    const ageGroup = ageInput?.parentElement;
    const age = parseInt(ageInput?.value) || 0;
    
    const isValidRange = age >= 13 && age <= 100;
    const isValid = ageInput?.value && isValidRange;
    
    if (ageGroup) {
      if (ageInput?.value && !isValid) {
        ageGroup.classList.add('error');
        ageInput.classList.add('invalid');
        ageInput.classList.remove('valid');
      } else if (ageInput?.value && isValid) {
        ageGroup.classList.remove('error');
        ageInput.classList.remove('invalid');
        ageInput.classList.add('valid');
      } else {
        ageGroup.classList.remove('error');
        ageInput.classList.remove('invalid', 'valid');
      }
    }
    
    return isValid;
  }

  validateStep2() {
    const isCountryValid = this.validateCountry();
    const isGenderValid = this.validateGender();
    const isAgeValid = this.validateAge();
    
    const isFormValid = isCountryValid && isGenderValid && isAgeValid;
    
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.disabled = !isFormValid;
      nextBtn.style.opacity = isFormValid ? '1' : '0.5';
    }

    return isFormValid;
  }

handleStep2Back() {
  // Save current data (even if incomplete) sebelum back
  this.saveCurrentStepData();
  this.goToStep(1);
}

  handleStep2Next() {
    if (!this.validateStep2()) {
      this.showMessage('Mohon lengkapi semua data yang diperlukan', 'error');
      return;
    }

    this.saveCurrentStepData();
    this.showMessage('Data tersimpan! Melanjutkan ke step berikutnya...', 'success');
    
    setTimeout(() => {
      // For now, redirect to login (will be changed to step 3 later)
      window.location.hash = '/login';
      console.log('Registration data:', this.getRegistrationData());
    }, 1500);
  }

  // NAVIGATION METHODS
// NAVIGATION METHODS - Update yang ini
goToStep(stepNumber) {
  this.currentStep = stepNumber;
  
  // Jangan ubah URL, cukup re-render internal
  this.reRender();
}

// Tambahkan method baru ini
async reRender() {
  // Get main container
  const container = document.querySelector('main') || document.querySelector('#app') || document.body;
  
  // Re-render content
  const newContent = await this.render();
  container.innerHTML = newContent;
  
  // Re-initialize events
  await this.afterRender();
}

saveCurrentStepData() {
  if (this.currentStep === 1) {
    // Save step 1 data
    const nameInput = document.getElementById('nameInput');
    const name = nameInput?.value?.trim() || '';
    
    if (name) {
      this.saveRegistrationData({ name });
    }
  } 
  else if (this.currentStep === 2) {
    // Save step 2 data (even if incomplete)
    const countrySelect = document.getElementById('countrySelect');
    const selectedGender = document.querySelector('.gender-option.selected');
    const ageInput = document.getElementById('ageInput');

    const data = {
      country: countrySelect?.value || '',
      gender: selectedGender?.dataset?.gender || '',
      age: ageInput?.value || ''
    };

    this.saveRegistrationData(data);
  }
}

  // SHARED METHODS
loadSavedData() {
  const savedData = this.getRegistrationData();
  
  if (this.currentStep === 1) {
    // Load name for step 1
    if (savedData.name) {
      const nameInput = document.getElementById('nameInput');
      if (nameInput) {
        nameInput.value = savedData.name;
        // Trigger validation after loading
        setTimeout(() => {
          this.validateStep1();
        }, 100);
      }
    }
  } 
  else if (this.currentStep === 2) {
    // Load data for step 2
    if (savedData.country) {
      const countrySelect = document.getElementById('countrySelect');
      if (countrySelect) {
        countrySelect.value = savedData.country;
      }
    }
    
    if (savedData.gender) {
      setTimeout(() => {
        const genderOption = document.querySelector(`[data-gender="${savedData.gender}"]`);
        if (genderOption) {
          this.selectGender(genderOption);
        }
      }, 100);
    }
    
    if (savedData.age) {
      const ageInput = document.getElementById('ageInput');
      if (ageInput) {
        ageInput.value = savedData.age;
      }
    }
    
    // Trigger validation after loading all data
    setTimeout(() => {
      this.validateStep2();
    }, 200);
  }
}

  saveRegistrationData(data) {
    const currentData = this.getRegistrationData();
    const updatedData = { ...currentData, ...data };
    localStorage.setItem('registrationData', JSON.stringify(updatedData));
    this.registrationData = updatedData;
  }

  getRegistrationData() {
    try {
      const data = localStorage.getItem('registrationData');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error parsing registration data:', error);
      return {};
    }
  }

  clearRegistrationData() {
    localStorage.removeItem('registrationData');
    this.registrationData = {};
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
    }, 3000);
  }
}