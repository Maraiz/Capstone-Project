export default class RegisterPage {
constructor() {
  this.app = null;
  this.currentStep = 1;
  this.maxStep = 4; // Updated from 3 to 4
  this.registrationData = {
    name: '',
    country: '',
    gender: '',
    age: '',
    // Step 3 data
    targetWeight: '',
    height: '',
    currentWeight: '',
    // Step 4 data
    weeklyTarget: '',
    targetDeadline: ''
  };
  
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
    case 3:
      return this.renderStep3();
    case 4:
      return this.renderStep4();
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
  return `
    <div class="container register-container register-step4">
      <h1 class="title">Selamat Datang</h1>
      
      <div class="form-container">
        <div class="left-section">
          <h2 class="section-title">Apa sasaran mingguanmu</h2>
          <p class="subtitle">Pilih Satu</p>
          
          <div class="input-group">
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="target" value="0.25" id="target025">
                <span class="radio-text">Naik 0,25 kg per minggu</span>
                <span class="radio-circle"></span>
              </label>
              
              <label class="radio-option">
                <input type="radio" name="target" value="1" id="target1">
                <span class="radio-text">Naik 1 kg per minggu</span>
                <span class="radio-circle"></span>
              </label>
            </div>
            <div class="form-error">Mohon pilih sasaran mingguan</div>
          </div>
        </div>
        
        <div class="right-section">
          <h2 class="section-title">Batas waktu Sasaran</h2>
          
          <div class="input-group">
            <div class="date-input-container">
              <input type="date" class="date-input" id="targetDeadlineInput">
            </div>
            <div class="form-error">Mohon pilih batas waktu sasaran</div>
          </div>
        </div>
      </div>
      
      <div class="button-container">
        <button class="btn btn-back" id="backBtn">
          <span class="arrow-left">←</span>
        </button>
        <button class="btn btn-primary" id="nextBtn" disabled>Selesai</button>
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
    case 3:
      this.initializeStep3();
      break;
    case 4:
      this.initializeStep4();
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
    this.goToStep(3); // Changed from redirect to login
  }, 1000);
}

  // STEP 3 METHODS
initializeStep3() {
  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      this.handleStep3Back();
    });
  }

  // Next button
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      this.handleStep3Next();
    });
  }

  // Target weight input (optional)
  const targetWeightInput = document.getElementById('targetWeightInput');
  if (targetWeightInput) {
    targetWeightInput.addEventListener('input', () => {
      this.validateTargetWeight();
      this.validateStep3();
    });

    targetWeightInput.addEventListener('blur', () => {
      this.validateTargetWeight();
    });
  }

  // Height input (required)
  const heightInput = document.getElementById('heightInput');
  if (heightInput) {
    heightInput.addEventListener('input', () => {
      this.validateHeight();
      this.validateStep3();
    });

    heightInput.addEventListener('blur', () => {
      this.validateHeight();
    });
  }

  // Current weight input (required)
  const currentWeightInput = document.getElementById('currentWeightInput');
  if (currentWeightInput) {
    currentWeightInput.addEventListener('input', () => {
      this.validateCurrentWeight();
      this.validateStep3();
    });

    currentWeightInput.addEventListener('blur', () => {
      this.validateCurrentWeight();
    });

    // Enter key support
    currentWeightInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const nextBtn = document.getElementById('nextBtn');
        if (!nextBtn.disabled) {
          this.handleStep3Next();
        }
      }
    });
  }
}

validateTargetWeight() {
  const targetWeightInput = document.getElementById('targetWeightInput');
  const targetWeightGroup = targetWeightInput?.parentElement?.parentElement;
  const targetWeight = parseFloat(targetWeightInput?.value) || 0;
  
  // Target weight is optional, so it's valid if empty or within range
  const isEmpty = !targetWeightInput?.value || targetWeightInput?.value.trim() === '';
  const isValidRange = targetWeight >= 30 && targetWeight <= 200;
  const isValid = isEmpty || isValidRange;
  
  if (targetWeightGroup) {
    if (!isEmpty && !isValid) {
      targetWeightGroup.classList.add('error');
      targetWeightInput.classList.add('invalid');
      targetWeightInput.classList.remove('valid');
    } else if (!isEmpty && isValid) {
      targetWeightGroup.classList.remove('error');
      targetWeightInput.classList.remove('invalid');
      targetWeightInput.classList.add('valid');
    } else {
      targetWeightGroup.classList.remove('error');
      targetWeightInput.classList.remove('invalid', 'valid');
    }
  }
  
  return isValid;
}

validateHeight() {
  const heightInput = document.getElementById('heightInput');
  const heightGroup = heightInput?.parentElement?.parentElement;
  const height = parseInt(heightInput?.value) || 0;
  
  const isValidRange = height >= 100 && height <= 250;
  const isValid = heightInput?.value && isValidRange;
  
  if (heightGroup) {
    if (heightInput?.value && !isValid) {
      heightGroup.classList.add('error');
      heightInput.classList.add('invalid');
      heightInput.classList.remove('valid');
    } else if (heightInput?.value && isValid) {
      heightGroup.classList.remove('error');
      heightInput.classList.remove('invalid');
      heightInput.classList.add('valid');
    } else {
      heightGroup.classList.remove('error');
      heightInput.classList.remove('invalid', 'valid');
    }
  }
  
  return isValid;
}

validateCurrentWeight() {
  const currentWeightInput = document.getElementById('currentWeightInput');
  const currentWeightGroup = currentWeightInput?.parentElement?.parentElement;
  const currentWeight = parseFloat(currentWeightInput?.value) || 0;
  
  const isValidRange = currentWeight >= 30 && currentWeight <= 300;
  const isValid = currentWeightInput?.value && isValidRange;
  
  if (currentWeightGroup) {
    if (currentWeightInput?.value && !isValid) {
      currentWeightGroup.classList.add('error');
      currentWeightInput.classList.add('invalid');
      currentWeightInput.classList.remove('valid');
    } else if (currentWeightInput?.value && isValid) {
      currentWeightGroup.classList.remove('error');
      currentWeightInput.classList.remove('invalid');
      currentWeightInput.classList.add('valid');
    } else {
      currentWeightGroup.classList.remove('error');
      currentWeightInput.classList.remove('invalid', 'valid');
    }
  }
  
  return isValid;
}

validateStep3() {
  const isTargetWeightValid = this.validateTargetWeight();
  const isHeightValid = this.validateHeight();
  const isCurrentWeightValid = this.validateCurrentWeight();
  
  // Target weight is optional, so only check height and current weight
  const isFormValid = isTargetWeightValid && isHeightValid && isCurrentWeightValid;
  
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.disabled = !isFormValid;
    nextBtn.style.opacity = isFormValid ? '1' : '0.5';
  }

  return isFormValid;
}

// STEP 4 METHODS
initializeStep4() {
  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      this.handleStep4Back();
    });
  }

  // Next button
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      this.handleStep4Next();
    });
  }

  // Radio buttons for weekly target
  const radioButtons = document.querySelectorAll('input[name="target"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', () => {
      this.validateWeeklyTarget();
      this.validateStep4();
    });
  });

  // Date input for deadline
  const dateInput = document.getElementById('targetDeadlineInput');
  if (dateInput) {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    dateInput.addEventListener('change', () => {
      this.validateTargetDeadline();
      this.validateStep4();
    });

    dateInput.addEventListener('blur', () => {
      this.validateTargetDeadline();
    });

    // Enter key support
    dateInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const nextBtn = document.getElementById('nextBtn');
        if (!nextBtn.disabled) {
          this.handleStep4Next();
        }
      }
    });
  }
}

validateWeeklyTarget() {
  const selectedRadio = document.querySelector('input[name="target"]:checked');
  const radioGroup = document.querySelector('.radio-group')?.parentElement;
  
  const isValid = selectedRadio !== null;
  
  if (radioGroup) {
    if (isValid) {
      radioGroup.classList.remove('error');
    } else {
      radioGroup.classList.add('error');
    }
  }
  
  return isValid;
}

validateTargetDeadline() {
  const dateInput = document.getElementById('targetDeadlineInput');
  const dateGroup = dateInput?.parentElement?.parentElement;
  const selectedDate = dateInput?.value;
  
  let isValid = false;
  
  if (selectedDate) {
    const inputDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    // Must be today or future date
    isValid = inputDate >= today;
  }
  
  if (dateGroup) {
    if (selectedDate && !isValid) {
      dateGroup.classList.add('error');
      dateInput.classList.add('invalid');
      dateInput.classList.remove('valid');
    } else if (selectedDate && isValid) {
      dateGroup.classList.remove('error');
      dateInput.classList.remove('invalid');
      dateInput.classList.add('valid');
    } else {
      dateGroup.classList.remove('error');
      dateInput.classList.remove('invalid', 'valid');
    }
  }
  
  return selectedDate && isValid;
}

validateStep4() {
  const isWeeklyTargetValid = this.validateWeeklyTarget();
  const isTargetDeadlineValid = this.validateTargetDeadline();
  
  const isFormValid = isWeeklyTargetValid && isTargetDeadlineValid;
  
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.disabled = !isFormValid;
    nextBtn.style.opacity = isFormValid ? '1' : '0.5';
  }

  return isFormValid;
}

handleStep4Back() {
  this.saveCurrentStepData();
  this.goToStep(3);
}

handleStep4Next() {
  if (!this.validateStep4()) {
    this.showMessage('Mohon lengkapi sasaran mingguan dan batas waktu', 'error');
    return;
  }

  this.saveCurrentStepData();
  this.showMessage('Registrasi berhasil! Selamat datang...', 'success');
  
  setTimeout(() => {
    // Complete registration - redirect to home or dashboard
    window.location.hash = '/home';
    console.log('Final registration data:', this.getRegistrationData());
    
    // Optional: Clear registration data after successful completion
    // this.clearRegistrationData();
  }, 2000);
}

handleStep3Back() {
  this.saveCurrentStepData();
  this.goToStep(2);
}

handleStep3Next() {
  if (!this.validateStep3()) {
    this.showMessage('Mohon lengkapi data tinggi dan berat badan yang diperlukan', 'error');
    return;
  }

  this.saveCurrentStepData();
  this.showMessage('Data tersimpan! Melanjutkan ke step berikutnya...', 'success');
  
  setTimeout(() => {
    this.goToStep(4); // Changed to step 4
  }, 1000);
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
    const nameInput = document.getElementById('nameInput');
    const name = nameInput?.value?.trim() || '';
    
    if (name) {
      this.saveRegistrationData({ name });
    }
  } 
  else if (this.currentStep === 2) {
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
  else if (this.currentStep === 3) {
    const targetWeightInput = document.getElementById('targetWeightInput');
    const heightInput = document.getElementById('heightInput');
    const currentWeightInput = document.getElementById('currentWeightInput');

    const data = {
      targetWeight: targetWeightInput?.value || '',
      height: heightInput?.value || '',
      currentWeight: currentWeightInput?.value || ''
    };

    this.saveRegistrationData(data);
  }
  else if (this.currentStep === 4) {
    const selectedRadio = document.querySelector('input[name="target"]:checked');
    const dateInput = document.getElementById('targetDeadlineInput');

    const data = {
      weeklyTarget: selectedRadio?.value || '',
      targetDeadline: dateInput?.value || ''
    };

    this.saveRegistrationData(data);
  }
}

  // SHARED METHODS
loadSavedData() {
  const savedData = this.getRegistrationData();
  
  if (this.currentStep === 1) {
    if (savedData.name) {
      const nameInput = document.getElementById('nameInput');
      if (nameInput) {
        nameInput.value = savedData.name;
        setTimeout(() => {
          this.validateStep1();
        }, 100);
      }
    }
  } 
  else if (this.currentStep === 2) {
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
    
    setTimeout(() => {
      this.validateStep2();
    }, 200);
  }
  else if (this.currentStep === 3) {
    if (savedData.targetWeight) {
      const targetWeightInput = document.getElementById('targetWeightInput');
      if (targetWeightInput) {
        targetWeightInput.value = savedData.targetWeight;
      }
    }
    
    if (savedData.height) {
      const heightInput = document.getElementById('heightInput');
      if (heightInput) {
        heightInput.value = savedData.height;
      }
    }
    
    if (savedData.currentWeight) {
      const currentWeightInput = document.getElementById('currentWeightInput');
      if (currentWeightInput) {
        currentWeightInput.value = savedData.currentWeight;
      }
    }
    
    setTimeout(() => {
      this.validateStep3();
    }, 200);
  }
  else if (this.currentStep === 4) {
    if (savedData.weeklyTarget) {
      const radioButton = document.querySelector(`input[name="target"][value="${savedData.weeklyTarget}"]`);
      if (radioButton) {
        radioButton.checked = true;
      }
    }
    
    if (savedData.targetDeadline) {
      const dateInput = document.getElementById('targetDeadlineInput');
      if (dateInput) {
        dateInput.value = savedData.targetDeadline;
      }
    }
    
    setTimeout(() => {
      this.validateStep4();
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