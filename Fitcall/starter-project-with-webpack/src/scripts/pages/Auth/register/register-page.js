export default class RegisterPage {
  constructor() {
    this.app = null;
    this.currentStep = 1;
    this.registrationData = {
      name: '',
      // Data lainnya akan ditambahkan di step berikutnya
    };
  }

  async render() {
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

  async afterRender() {
    this.initializeEventListeners();
    this.loadSavedData();
  }

  loadSavedData() {
    // Load data yang tersimpan jika user kembali ke step ini
    const savedData = this.getRegistrationData();
    if (savedData.name) {
      const nameInput = document.getElementById('nameInput');
      if (nameInput) {
        nameInput.value = savedData.name;
        this.validateForm();
      }
    }
  }

  initializeEventListeners() {
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.handleBack();
      });
    }

    // Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.handleNext();
      });
    }

    // Name input validation
    const nameInput = document.getElementById('nameInput');
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        this.validateForm();
      });

      nameInput.addEventListener('blur', () => {
        this.validateName();
      });

      // Enter key support
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!nextBtn.disabled) {
            this.handleNext();
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

  validateForm() {
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

  handleBack() {
    // Kembali ke halaman login atau home
    window.location.hash = '/login';
  }

  handleNext() {
    if (!this.validateForm()) {
      this.showMessage('Mohon masukkan nama yang valid', 'error');
      return;
    }

    const nameInput = document.getElementById('nameInput');
    const name = nameInput?.value?.trim();

    if (name) {
      // Simpan data ke registration state
      this.saveRegistrationData({ name });
      
      // Show success feedback
      this.showMessage('Data tersimpan! Melanjutkan...', 'success');
      
      // Redirect ke step berikutnya (akan dibuat nanti)
      setTimeout(() => {
        // Untuk sementara kembali ke login, nanti diganti ke register step 2
        window.location.hash = '/login';
        console.log('Registration data:', this.getRegistrationData());
      }, 1500);
    }
  }

  // Registration data management
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
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create and show new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }
}