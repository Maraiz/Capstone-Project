import RegisterModel from './register-model.js';

export default class RegisterPresenter {
constructor(view) {
  this.view = view;
  this.model = new RegisterModel();
  this.currentStep = 1;
  this.maxStep = 7; // Update dari 6 ke 7
  
  // Set presenter reference in view
  this.view.setPresenter(this);
  
  // Initialize
  this.initializeStep();
}
  // Initialization
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
    // Load saved data from storage
    this.model.loadFromStorage();
    
    // Set current step in view
    this.view.setCurrentStep(this.currentStep);
    
    // Load saved data into form
    const savedData = this.model.getData();
    this.view.loadFormData(savedData);
    
    // Validate current step after a short delay
    setTimeout(() => {
      this.validateCurrentStep();
    }, 200);
  }

  // Navigation handlers
  async goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.maxStep) return;
    
    this.currentStep = stepNumber;
    this.view.setCurrentStep(stepNumber);
    await this.view.reRender();
    
    // Re-initialize after render
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
    case 7: // Tambah case 7
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
    // Step 7 adalah step terakhir, langsung complete registration
    this.handleComplete();
    return;
  }

  // Show success message and proceed
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

  // Field change handler
  handleFieldChange(field, value) {
    // Update model
    this.model.setData(field, value);
    
    // Validate field
    const validation = this.model.validateField(field, value);
    this.view.updateFormValidation(field, validation);
    
    // Validate entire step
    this.validateCurrentStep();
  }

  // Special handlers for complex fields
  handleGenderSelection(gender) {
    this.model.setData('gender', gender);
    this.view.selectGender(gender);
    this.validateCurrentStep();
  }

  handleRadioSelection(field, value) {
    this.model.setData(field, value);
    this.validateCurrentStep();
  }

  // Validation
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

  // Data getters for view
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

  // Complete registration
async handleComplete() {
  try {
    // Validasi final
    const step7Validation = this.model.validateStep(7);
    if (!step7Validation.valid) {
      this.showValidationErrors(step7Validation.fieldResults);
      this.view.showMessage('Mohon lengkapi semua data akun', 'error');
      return;
    }

    const success = this.model.completeRegistration();
    
    if (success) {
      this.view.showMessage('Akun berhasil dibuat! Selamat memulai perjalanan sehatmu!', 'success');
      
      setTimeout(() => {
        window.location.hash = '/home';
      }, 2000);
    } else {
      this.view.showMessage('Terjadi kesalahan saat menyimpan data', 'error');
    }
  } catch (error) {
    console.error('Error completing registration:', error);
    this.view.showMessage('Terjadi kesalahan saat menyimpan data', 'error');
  }
}

  // Detail toggle for step 6
  handleDetailToggle() {
    this.view.toggleDetailBreakdown();
  }

  // Error handling
  handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    this.view.showMessage('Terjadi kesalahan. Silakan coba lagi.', 'error');
  }

  // Public API
  getCurrentStep() {
    return this.currentStep;
  }

  getMaxStep() {
    return this.maxStep;
  }

  getProgress() {
    return (this.currentStep / this.maxStep) * 100;
  }

  // Clean up
  destroy() {
    this.model.clearStorage();
  }
}