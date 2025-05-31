export default class LandingPage {
  constructor() {
    this.currentSlide = 1;
    this.totalSlides = 3;
    this.slideInterval = null;
    this.slides = [
      {
        title: 'REACH YOUR LIMITS<br>AND GET TO THE<br><span class="highlight">NEXT LEVEL</span>',
        description: 'Transform your body and mind with our comprehensive fitness programs. Join thousands of people who have already achieved their fitness goals.',
        background: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'
      },
      {
        title: 'BUILD YOUR<br><span class="highlight">STRENGTH</span><br>AND CONFIDENCE',
        description: 'Professional trainers will guide you through personalized workout plans designed to maximize your results and keep you motivated every step of the way.',
        background: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'
      },
      {
        title: 'JOIN THE<br><span class="highlight">FITNESS</span><br>REVOLUTION',
        description: 'Be part of a community that supports each other. Track your progress, celebrate victories, and push your limits with people who share your passion.',
        background: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }
    ];
  }

  async render() {
    return `
      <div class="landing-container">
        <!-- Header dengan Logo -->
        <header class="landing-header">
          <div class="logo">
            <i class="fas fa-dumbbell"></i>
            <span>FitCall</span>
          </div>
        </header>

        <!-- Hero Section -->
        <main class="hero" id="heroSection">
          <div class="hero-content">
            <h1 class="hero-title" id="heroTitle">
              REACH YOUR LIMITS<br>
              AND GET TO THE<br>
              <span class="highlight">NEXT LEVEL</span>
            </h1>
            
            <p class="hero-description" id="heroDescription">
              Transform your body and mind with our comprehensive fitness programs. 
              Join thousands of people who have already achieved their fitness goals.
            </p>

            <div class="cta-buttons">
              <button class="btn btn-secondary" id="loginBtn">Masuk</button>
              <button class="btn btn-primary" id="registerBtn">Daftar Gratis</button>
            </div>
          </div>

          <!-- Navigation Dots -->
          <div class="navigation">
            <button class="nav-btn prev" id="prevBtn">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="nav-btn next" id="nextBtn">
              <i class="fas fa-chevron-right"></i>
            </button>
            <div class="slide-indicators">
              <span class="slide-number" id="currentSlideNumber">01</span>
              <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
              </div>
              <span class="slide-number">0${this.totalSlides}</span>
            </div>
          </div>

          <!-- Social Media -->
          <div class="social-media">
            <span class="social-label">SOCIAL</span>
            <div class="social-icons">
              <a href="https://facebook.com" target="_blank" class="social-icon" rel="noopener noreferrer">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" target="_blank" class="social-icon" rel="noopener noreferrer">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com" target="_blank" class="social-icon" rel="noopener noreferrer">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="mailto:info@fitcall.com" class="social-icon">
                <i class="fas fa-envelope"></i>
              </a>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  async afterRender() {
    this.initializeEventListeners();
    this.startSlideshow();
    this.updateSlide(this.currentSlide);
  }

  initializeEventListeners() {
    // CTA Buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        this.navigateToLogin();
      });
    }

    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        this.navigateToRegister();
      });
    }

    // Navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.previousSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextSlide();
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });

    // Touch/swipe support for mobile
    this.initializeTouchEvents();

    // Pause slideshow on hover
    const heroSection = document.getElementById('heroSection');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', () => {
        this.pauseSlideshow();
      });

      heroSection.addEventListener('mouseleave', () => {
        this.startSlideshow();
      });
    }
  }

  initializeTouchEvents() {
    let startX = 0;
    let endX = 0;

    const heroSection = document.getElementById('heroSection');
    if (!heroSection) return;

    heroSection.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    heroSection.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      this.handleSwipe(startX, endX);
    });
  }

  handleSwipe(startX, endX) {
    const threshold = 50; // Minimum swipe distance
    const diff = startX - endX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - next slide
        this.nextSlide();
      } else {
        // Swipe right - previous slide
        this.previousSlide();
      }
    }
  }

  navigateToLogin() {
    this.showTransition();
    setTimeout(() => {
      window.location.hash = '/login';
    }, 300);
  }

  navigateToRegister() {
    this.showTransition();
    setTimeout(() => {
      window.location.hash = '/register';
    }, 300);
  }

  showTransition() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.transform = 'scale(0.95)';
      heroContent.style.opacity = '0.7';
      
      setTimeout(() => {
        heroContent.style.transform = 'scale(1)';
        heroContent.style.opacity = '1';
      }, 300);
    }
  }

  nextSlide() {
    this.currentSlide = this.currentSlide >= this.totalSlides ? 1 : this.currentSlide + 1;
    this.updateSlide(this.currentSlide);
    this.restartSlideshow();
  }

  previousSlide() {
    this.currentSlide = this.currentSlide <= 1 ? this.totalSlides : this.currentSlide - 1;
    this.updateSlide(this.currentSlide);
    this.restartSlideshow();
  }

  updateSlide(slideNumber) {
    const slide = this.slides[slideNumber - 1];
    if (!slide) return;

    // Update content with animation
    this.animateContentChange(() => {
      // Update title
      const heroTitle = document.getElementById('heroTitle');
      if (heroTitle) {
        heroTitle.innerHTML = slide.title;
      }

      // Update description
      const heroDescription = document.getElementById('heroDescription');
      if (heroDescription) {
        heroDescription.textContent = slide.description;
      }

      // Update background
      const heroSection = document.getElementById('heroSection');
      if (heroSection) {
        heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${slide.background}')`;
      }
    });

    // Update slide number
    const currentSlideNumber = document.getElementById('currentSlideNumber');
    if (currentSlideNumber) {
      currentSlideNumber.textContent = `0${slideNumber}`;
    }

    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      const progressWidth = (slideNumber / this.totalSlides) * 100;
      progressFill.style.width = `${progressWidth}%`;
    }
  }

  animateContentChange(callback) {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) {
      callback();
      return;
    }

    // Fade out
    heroContent.style.transition = 'all 0.3s ease';
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';

    setTimeout(() => {
      callback();
      
      // Fade in
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 300);
  }

  startSlideshow() {
    this.pauseSlideshow(); // Clear any existing interval
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  pauseSlideshow() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  restartSlideshow() {
    this.pauseSlideshow();
    this.startSlideshow();
  }

  // Cleanup when page is destroyed
  destroy() {
    this.pauseSlideshow();
    document.removeEventListener('keydown', this.keyboardHandler);
  }
}