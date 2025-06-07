import RegisterModel from './register-model.js';

export default class RegisterPresenter {
  constructor(view) {
    this.view = view;
    this.model = new RegisterModel();
    this.currentStep = 1;
    this.maxStep = 7;
    
    this.view.setPresenter(this);
    this.initializeStep();
  }

  // ================================
  // INITIALIZATION - NO localStorage
  // ================================

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

  async initialize() {
    // NO localStorage load
    // Fresh form every time
    this.view.setCurrentStep(this.currentStep);
    
    setTimeout(() => {
      this.validateCurrentStep();
    }, 200);
  }

  // ================================
  // NAVIGATION
  // ================================

  async goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.maxStep) return;
    
    this.currentStep = stepNumber;
    this.view.setCurrentStep(stepNumber);
    await this.view.reRender();
    
    await this.initialize();
  }

  handleBackButton(stepNumber) {
    switch(stepNumber) {
      case 1:
        window.location.hash = '/login';
        break;
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        this.goToStep(stepNumber - 1);
        break;
    }
  }

  async handleNextButton(stepNumber) {
    const validation = this.model.validateStep(stepNumber);
    
    if (!validation.valid) {
      this.showValidationErrors(validation.fieldResults);
      this.view.showMessage('Mohon lengkapi semua data yang diperlukan', 'error');
      return;
    }

    if (stepNumber === 7) {
      this.handleComplete();
      return;
    }

    this.view.showMessage('Data tersimpan! Melanjutkan...', 'success');
    
    setTimeout(async () => {
      if (stepNumber < this.maxStep) {
        await this.goToStep(stepNumber + 1);
      }
    }, 1000);
  }

  async handleContinueToAccount() {
    this.view.showMessage('Melanjutkan ke pembuatan akun...', 'info');
    
    setTimeout(async () => {
      await this.goToStep(7);
    }, 1000);
  }

  // ================================
  // FORM HANDLING
  // ================================

  handleFieldChange(field, value) {
    this.model.setData(field, value);
    
    const validation = this.model.validateField(field, value);
    this.view.updateFormValidation(field, validation);
    
    this.validateCurrentStep();
  }

  handleGenderSelection(gender) {
    this.model.setData('gender', gender);
    this.view.selectGender(gender);
    this.validateCurrentStep();
  }

  handleRadioSelection(field, value) {
    this.model.setData(field, value);
    this.validateCurrentStep();
  }

  // ================================
  // VALIDATION
  // ================================

  validateCurrentStep() {
    const validation = this.model.validateStep(this.currentStep);
    this.view.updateButtonState(this.currentStep, validation.valid);
    return validation.valid;
  }

  showValidationErrors(fieldResults) {
    Object.keys(fieldResults).forEach(field => {
      const validation = fieldResults[field];
      this.view.updateFormValidation(field, validation);
    });
  }

  // ================================
  // COMPLETE REGISTRATION
  // ================================

  async handleComplete() {
    try {
      this.setButtonLoading(true);

      const step7Validation = this.model.validateStep(7);
      if (!step7Validation.valid) {
        this.showValidationErrors(step7Validation.fieldResults);
        this.view.showMessage('Mohon lengkapi semua data akun', 'error');
        this.setButtonLoading(false);
        return;
      }

      this.view.showMessage('Sedang memproses registrasi...', 'info');

      const result = await this.model.completeRegistration();
      
      if (result.success) {
        this.view.showMessage(result.message, 'success');
        
        setTimeout(() => {
          window.location.hash = '/login';
        }, 2000);
      } else {
        this.handleRegistrationError(result);
        this.setButtonLoading(false);
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      this.view.showMessage('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.', 'error');
      this.setButtonLoading(false);
    }
  }

  handleRegistrationError(result) {
    const { message, statusCode, validationErrors } = result;
    
    this.view.showMessage(message, 'error');
    
    if (statusCode === 400) {
      if (message.includes('Email sudah terdaftar')) {
        this.highlightField('emailInput');
      } else if (message.includes('Username sudah digunakan')) {
        this.highlightField('usernameInput');
      } else if (message.includes('Password dan Confirm Password tidak cocok')) {
        this.highlightField('confirmPasswordInput');
      }
    }
    
    if (validationErrors) {
      validationErrors.forEach(error => {
        const fieldName = error.field;
        const fieldInput = document.getElementById(fieldName + 'Input');
        if (fieldInput) {
          this.view.updateFormValidation(fieldName, {
            valid: false,
            message: error.message
          });
        }
      });
    }
  }

  highlightField(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      setTimeout(() => {
        input.focus();
        input.select();
      }, 100);
    }
  }

  setButtonLoading(isLoading) {
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.disabled = isLoading;
      const btnText = nextBtn.querySelector('.btn-text');
      const btnLoading = nextBtn.querySelector('.btn-loading');
      
      if (btnText && btnLoading) {
        btnText.style.display = isLoading ? 'none' : 'inline';
        btnLoading.style.display = isLoading ? 'inline' : 'none';
      } else {
        nextBtn.textContent = isLoading ? 'Memproses...' : 'Buat Akun';
      }
    }
  }

  // ================================
  // DATA GETTERS
  // ================================

  getRegistrationData() {
    return this.model.getData();
  }

  getCountries() {
    return this.model.getCountries();
  }

  getWeeklyTargets() {
    return this.model.getWeeklyTargets();
  }

  getActivityLevels() {
    return this.model.getActivityLevels();
  }

  getTodayDateString() {
    return this.model.getTodayDateString();
  }

  getCalorieCalculation() {
    return this.model.calculateCalories();
  }

  handleDetailToggle() {
    this.view.toggleDetailBreakdown();
  }

  handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    this.view.showMessage('Terjadi kesalahan. Silakan coba lagi.', 'error');
  }

  getCurrentStep() {
    return this.currentStep;
  }

  getMaxStep() {
    return this.maxStep;
  }

  getProgress() {
    return (this.currentStep / this.maxStep) * 100;
  }
}