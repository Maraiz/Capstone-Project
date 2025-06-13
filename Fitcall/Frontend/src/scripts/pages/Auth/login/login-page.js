import LoginPresenter from './login-presenter.js';

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPresenter(this);
  }

  async render() {
    return `
      <div class="container login-container">
        <h1 class="title">Selamat Datang</h1>
        
        <div class="form-section">
          <h2 class="question">Hampir selesai, Sekarang buat akun anda!</h2>
          
          <form id="loginForm" class="login-form">
            <div class="input-group">
              <label class="input-label">Alamat Email</label>
              <input type="email" id="email" class="input-field" placeholder="Masukkan email Anda" required>
              <div class="form-error">Mohon masukkan email yang valid</div>
            </div>

            <div class="input-group">
              <label class="input-label">Kata Sandi</label>
              <div class="password-container">
                <input type="password" id="password" class="input-field" placeholder="Masukkan password" required>
                <button type="button" class="password-toggle" id="togglePassword">
                  <span class="eye-icon">👁️</span>
                </button>
              </div>
              <div class="form-error">Password minimal 6 karakter</div>
            </div>

            <div class="checkbox-container" id="termsContainer">
              <div class="checkbox" id="termsCheckbox"></div>
              <div class="checkbox-text">
                Saya menyetujui <a href="#" id="termsLink">Syarat dan ketentuan</a> dan <a href="#" id="privacyLink">Kebijakan Privasi</a> FittCall
              </div>
            </div>
          </form>
        </div>
        
        <div class="button-container">
          <button class="btn btn-back" id="backBtn">
            <span class="arrow-left">←</span>
          </button>
          <button class="btn btn-primary" id="nextBtn" type="submit" form="loginForm">
            <span class="btn-text">Berikutnya</span>
            <span class="btn-loading">Loading...</span>
          </button>
        </div>

        <!-- Additional Links -->
        <div class="additional-links">
          <p>Belum punya akun? <a href="#/register" id="registerLink">Daftar di sini</a></p>
          <p><a href="#/forgot-password" id="forgotPasswordLink">Lupa password?</a></p>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.initializeEventListeners();
    this.presenter.checkAuthState();
    this.focusFirstInput();
  }

  initializeEventListeners() {
    // Toggle checkbox
    this.initializeCheckbox();
    
    // Form submission
    this.initializeFormSubmission();
    
    // Back button
    this.initializeBackButton();
    
    // Form validation
    this.initializeFormValidation();
    
    // Password toggle
    this.initializePasswordToggle();
    
    // Links
    this.initializeLinks();
    
    // Keyboard shortcuts
    this.initializeKeyboardShortcuts();
    
    // Initial validation
    this.validateForm();
  }

  initializeCheckbox() {
    const termsContainer = document.getElementById('termsContainer');
    const checkbox = document.getElementById('termsCheckbox');
    
    if (termsContainer && checkbox) {
      termsContainer.addEventListener('click', (e) => {
        if (e.target.tagName !== 'A') {
          checkbox.classList.toggle('checked');
          this.validateForm();
        }
      });
    }
  }

  initializeFormSubmission() {
    const form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }

  initializeBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // ✅ Jika user sudah login, tidak bisa kembali ke halaman awal
        if (this.presenter.model.isAuthenticated()) {
          this.showMessage('Anda sudah login. Silakan logout terlebih dahulu untuk kembali.', 'info');
          setTimeout(() => {
            window.location.hash = '/home';
          }, 2000);
        } else {
          // Konfirmasi sebelum kembali jika ada input
          const hasInput = this.hasFormInput();
          if (hasInput) {
            const confirmed = confirm('Data yang Anda masukkan akan hilang. Yakin ingin kembali?');
            if (confirmed) {
              window.location.hash = '/';
            }
          } else {
            window.location.hash = '/';
          }
        }
      });
    }
  }

  initializeFormValidation() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
      emailInput.addEventListener('input', () => this.validateForm());
      emailInput.addEventListener('blur', () => this.validateEmail());
      emailInput.addEventListener('focus', () => this.clearFieldError('email'));
    }
    
    if (passwordInput) {
      passwordInput.addEventListener('input', () => this.validateForm());
      passwordInput.addEventListener('blur', () => this.validatePassword());
      passwordInput.addEventListener('focus', () => this.clearFieldError('password'));
    }
  }

  initializePasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
      togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const eyeIcon = togglePassword.querySelector('.eye-icon');
        if (eyeIcon) {
          eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
        }
      });
    }
  }

  initializeLinks() {
    // Prevent terms and privacy links from toggling checkbox
    const links = document.querySelectorAll('#termsLink, #privacyLink');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showMessage('Fitur ini akan segera tersedia', 'info');
      });
    });

    // Register link
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
      registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '/register';
      });
    }

    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showMessage('Fitur reset password akan segera tersedia', 'info');
      });
    }
  }

  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Enter key pada form
      if (e.key === 'Enter' && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.id === 'email' || activeElement.id === 'password')) {
          e.preventDefault();
          this.handleSubmit();
        }
      }
      
      // Escape key untuk clear form
      if (e.key === 'Escape') {
        this.clearForm();
      }
    });
  }

  handleSubmit() {
    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value?.trim();
    
    // Validasi sebelum submit
    if (!this.validateEmail() || !this.validatePassword()) {
      this.showMessage('Mohon perbaiki data yang tidak valid', 'error');
      return;
    }
    
    if (!this.isTermsChecked()) {
      this.showMessage('Mohon setujui syarat dan ketentuan terlebih dahulu', 'error');
      return;
    }
    
    this.presenter.handleLogin(email, password);
  }

  validateEmail() {
    const emailInput = document.getElementById('email');
    const emailGroup = emailInput?.parentElement;
    const email = emailInput?.value?.trim() || '';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = email === '' || emailRegex.test(email);
    
    if (emailGroup) {
      if (email && !isValid) {
        emailGroup.classList.add('error');
        emailInput.classList.add('invalid');
        emailInput.classList.remove('valid');
      } else if (email && isValid) {
        emailGroup.classList.remove('error');
        emailInput.classList.remove('invalid');
        emailInput.classList.add('valid');
      } else {
        emailGroup.classList.remove('error');
        emailInput.classList.remove('invalid', 'valid');
      }
    }
    
    return email === '' || isValid;
  }

  validatePassword() {
    const passwordInput = document.getElementById('password');
    const passwordGroup = passwordInput?.parentElement?.parentElement || passwordInput?.parentElement;
    const password = passwordInput?.value?.trim() || '';
    
    const isValid = password === '' || password.length >= 6;
    
    if (passwordGroup) {
      if (password && !isValid) {
        passwordGroup.classList.add('error');
        passwordInput.classList.add('invalid');
        passwordInput.classList.remove('valid');
      } else if (password && isValid) {
        passwordGroup.classList.remove('error');
        passwordInput.classList.remove('invalid');
        passwordInput.classList.add('valid');
      } else {
        passwordGroup.classList.remove('error');
        passwordInput.classList.remove('invalid', 'valid');
      }
    }
    
    return password === '' || isValid;
  }

  validateForm() {
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value?.trim() || '';
    const isTermsChecked = this.isTermsChecked();
    const nextBtn = document.getElementById('nextBtn');

    const emailValid = email && this.validateEmail() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password && this.validatePassword() && password.length >= 6;
    const isValid = emailValid && passwordValid && isTermsChecked;
    
    if (nextBtn) {
      nextBtn.disabled = !isValid;
      nextBtn.style.opacity = isValid ? '1' : '0.6';
      nextBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }
    
    return isValid;
  }

  isTermsChecked() {
    return document.getElementById('termsCheckbox')?.classList.contains('checked') || false;
  }

  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const fieldGroup = field?.parentElement?.parentElement || field?.parentElement;
    
    if (fieldGroup) {
      fieldGroup.classList.remove('error');
    }
    
    if (field) {
      field.classList.remove('invalid');
    }
  }

  hasFormInput() {
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value?.trim() || '';
    return email.length > 0 || password.length > 0;
  }

  clearForm() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const checkbox = document.getElementById('termsCheckbox');
    
    if (emailInput) {
      emailInput.value = '';
      emailInput.classList.remove('valid', 'invalid');
    }
    
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.classList.remove('valid', 'invalid');
      passwordInput.type = 'password';
    }
    
    if (checkbox) {
      checkbox.classList.remove('checked');
    }
    
    // Clear all error states
    const errorGroups = document.querySelectorAll('.input-group.error');
    errorGroups.forEach(group => group.classList.remove('error'));
    
    this.validateForm();
  }

  focusFirstInput() {
    const emailInput = document.getElementById('email');
    if (emailInput && !this.presenter.model.isAuthenticated()) {
      setTimeout(() => {
        emailInput.focus();
      }, 100);
    }
  }

  showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create and show new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
      <span class="message-text">${message}</span>
      <button class="message-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Insert at top of container
    const container = document.querySelector('.login-container');
    if (container) {
      container.insertBefore(messageDiv, container.firstChild);
    } else {
      document.body.appendChild(messageDiv);
    }
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 4000);

    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showLoading(isLoading) {
    const nextBtn = document.getElementById('nextBtn');
    const btnText = nextBtn?.querySelector('.btn-text');
    const btnLoading = nextBtn?.querySelector('.btn-loading');
    
    if (nextBtn) {
      if (isLoading) {
        nextBtn.classList.add('loading');
        nextBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';
      } else {
        nextBtn.classList.remove('loading');
        nextBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
        this.validateForm();
      }
    }
  }

  // Method untuk handle resize window
  handleResize() {
    // Adjust layout jika diperlukan
    const container = document.querySelector('.login-container');
    if (container && window.innerHeight < 600) {
      container.classList.add('compact-mode');
    } else if (container) {
      container.classList.remove('compact-mode');
    }
  }

  // Clean up event listeners saat component di-destroy
  destroy() {
    // Remove global event listeners
    document.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('resize', this.resizeHandler);
    
    // Clear any remaining timeouts
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
  }
}