export default class LoginPage {
  constructor() {
    this.app = null; // Will be set by app instance if needed
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
              <input type="email" id="email" class="input-field" placeholder="" required>
              <div class="form-error">Mohon masukkan email yang valid</div>
            </div>

            <div class="input-group">
              <label class="input-label">Kata Sandi</label>
              <input type="password" id="password" class="input-field" placeholder="" required>
              <div class="form-error">Password minimal 6 karakter</div>
            </div>

            <div class="checkbox-container" id="termsContainer">
              <div class="checkbox" id="termsCheckbox"></div>
              <div class="checkbox-text">
                Saya menyetujui <a href="#" id="termsLink">Syarat dan ketentuan</a> dan <a href="#" id="privacyLink">kebijakan Privasi</a> FittCall
              </div>
            </div>
          </form>
        </div>
        
        <div class="button-container">
          <button class="btn btn-back" id="backBtn">
            <span class="arrow-left">←</span>
          </button>
          <button class="btn btn-primary" id="nextBtn" type="submit" form="loginForm">Berikutnya</button>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.initializeEventListeners();
    this.checkAuthState();
  }

  checkAuthState() {
    // Redirect if already logged in
    if (localStorage.getItem('token')) {
      this.showMessage('Anda sudah login', 'info');
      setTimeout(() => {
        window.location.hash = '/';
      }, 1500);
    }
  }

  initializeEventListeners() {
    // Toggle checkbox
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

    // Form submission
    const form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.hash = '/';
      });
    }

    // Form validation
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
      emailInput.addEventListener('input', () => this.validateForm());
      emailInput.addEventListener('blur', () => this.validateEmail());
    }
    
    if (passwordInput) {
      passwordInput.addEventListener('input', () => this.validateForm());
      passwordInput.addEventListener('blur', () => this.validatePassword());
    }

    // Prevent link clicks from toggling checkbox
    const links = document.querySelectorAll('#termsLink, #privacyLink');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Link clicked:', e.target.textContent);
        // You can implement modal or redirect to terms page here
      });
    });

    // Initial validation
    this.validateForm();
  }

  validateEmail() {
    const emailInput = document.getElementById('email');
    const emailGroup = emailInput?.parentElement;
    const email = emailInput?.value?.trim() || '';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
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
    
    return isValid;
  }

  validatePassword() {
    const passwordInput = document.getElementById('password');
    const passwordGroup = passwordInput?.parentElement;
    const password = passwordInput?.value?.trim() || '';
    
    const isValid = password.length >= 6;
    
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
    
    return isValid;
  }

  validateForm() {
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value?.trim() || '';
    const isTermsChecked = document.getElementById('termsCheckbox')?.classList.contains('checked') || false;
    const nextBtn = document.getElementById('nextBtn');

    const emailValid = this.validateEmail();
    const passwordValid = this.validatePassword();
    const isValid = email && password && isTermsChecked && emailValid && passwordValid;
    
    if (nextBtn) {
      nextBtn.disabled = !isValid;
      nextBtn.style.opacity = isValid ? '1' : '0.5';
    }
  }

async handleLogin() {
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value?.trim();

  if (!email || !password) {
    this.showMessage('Mohon lengkapi semua field', 'error');
    return;
  }

  // Final validation
  if (!this.validateEmail() || !this.validatePassword()) {
    this.showMessage('Mohon perbaiki data yang tidak valid', 'error');
    return;
  }

  try {
    // Show loading state - FIXED
    const nextBtn = document.getElementById('nextBtn');
    const originalText = nextBtn?.textContent || 'Berikutnya';
    
    if (nextBtn) {
      nextBtn.classList.add('loading');
      nextBtn.disabled = true;
      // Don't change text content when using CSS loading spinner
      // nextBtn.textContent = 'Loading...'; // Remove this line
    }

    // Simulate API call
    const response = await this.loginUser(email, password);
    
    if (response.success) {
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token || 'mock-token-' + Date.now());
      
      // Show success message
      this.showMessage('Login berhasil! Mengalihkan...', 'success');
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.hash = '/';
      }, 1500);
    } else {
      this.showMessage(response.message || 'Login gagal. Silakan coba lagi.', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    this.showMessage('Terjadi kesalahan. Silakan coba lagi.', 'error');
  } finally {
    // Restore button state - FIXED
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.classList.remove('loading');
      nextBtn.textContent = 'Berikutnya'; // Restore original text
      this.validateForm(); // Re-validate to set proper disabled state
    }
  }
}

  async loginUser(email, password) {
    // Simulate API call with Promise
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock authentication logic
        if (email && password.length >= 6) {
          resolve({
            success: true,
            user: {
              id: Math.floor(Math.random() * 1000),
              email: email,
              name: email.split('@')[0] || 'User',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=007AFF&color=fff`
            },
            token: 'mock-jwt-token-' + Date.now()
          });
        } else {
          resolve({
            success: false,
            message: password.length < 6 
              ? 'Password minimal 6 karakter' 
              : 'Email atau password tidak valid'
          });
        }
      }, 1500); // Simulate network delay
    });
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
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 4000);
  }
}