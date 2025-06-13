import { predictImage } from '../../data/api.js';

export default class HomePresenter {
  constructor(view, model = null) {
    this.view = view;
    // **FIX 1: Use shared model instance instead of creating new one**
    this.model = model || view.model;
    this.timerInterval = null;
    this.timeLeft = 0;
  }

  checkAuthState() {
    if (!this.model.getToken()) {
      this.view.showMessage('Silakan login terlebih dahulu', 'error');
      setTimeout(() => {
        window.location.hash = '/login';
      }, 1500);
    }
  }

  handleLogout() {
    // Clear auth dan reset model
    this.model.clearAuth();
    
    this.view.showMessage('Logout berhasil! Mengalihkan ke halaman awal...', 'success');
    setTimeout(() => {
      window.location.hash = '/';
    }, 1500);
  }

  // **FIX 2: Updated meal operations with proper error handling**
  async handleAddMeal(mealData, predictedName) {
    try {
      const meal = await this.model.addMeal({ ...mealData, name: predictedName });
      
      // Refresh meal list dari model
      this.view.updateMealList(this.model.getMeals());
      this.updateCaloriesDisplay();
      
      this.view.showMessage(`Latihan ${predictedName} berhasil ditambahkan!`, 'success');
      return meal;
    } catch (error) {
      this.view.showMessage('Gagal menambahkan latihan', 'error');
      console.error('Error adding meal:', error);
    }
  }

  async handleDeleteMeal(id) {
    try {
      const deletedMeal = await this.model.deleteMeal(id); // Make async
      if (deletedMeal) {
        this.updateCaloriesDisplay();
        this.view.updateMealList(this.model.getMeals());
        this.view.showMessage('Latihan dihapus', 'info');
      }
    } catch (error) {
      this.view.showMessage('Gagal menghapus latihan', 'error');
      console.error('Error deleting meal:', error);
    }
  }

  // Exercise operations
  handleStartExercise(meal) {
    this.model.setSelectedMeal(meal);
    this.model.setCurrentDuration(Math.max(10, parseInt(meal.description.split(' ')[1]) || 10));
    
    this.view.showExercisePreparation(meal);
    
    setTimeout(() => {
      this.timeLeft = this.model.getCurrentDuration();
      this.view.showExerciseTimer();
      this.startTimer();
    }, 3000);
  }

  startTimer() {
    this.view.updateTimerDisplay(this.timeLeft);
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.view.updateTimerDisplay(this.timeLeft);
      } else {
        this.stopTimer();
        this.view.showExerciseComplete();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  pauseTimer() {
    this.stopTimer();
    this.view.showTimerPaused();
  }

  resumeTimer() {
    this.view.showTimerRunning();
    this.startTimer();
  }

  async handleCompleteExercise() {
    const selectedMeal = this.model.getSelectedMeal();
    if (selectedMeal) {
      const completedMeal = await this.model.completeExercise(selectedMeal.id, this.model.getCurrentDuration());
      if (completedMeal) {
        this.updateCaloriesDisplay();
        this.view.updateMealList(this.model.getMeals());
        this.view.showMessage(`Latihan selesai! Kalori terbakar: ${completedMeal.finalCalories} kkal`, 'success');
      }
    }
    this.cleanup();
  }

  async handleSaveExercise() {
    const selectedMeal = this.model.getSelectedMeal();
    if (selectedMeal) {
      const finalCalories = await this.model.calculateCalories(this.model.getCurrentDuration(), selectedMeal.name);
      const updates = {
        finalCalories: finalCalories,
        description: `Duration: ${this.model.getCurrentDuration()} seconds`,
        calories: finalCalories
      };
      
      await this.model.updateMeal(selectedMeal.id, updates);
      this.view.updateMealList(this.model.getMeals());
      this.view.showMessage(`Latihan disimpan! Estimasi kalori: ${finalCalories} kkal`, 'success');
    }
    this.cleanup();
  }

  async handleDurationChange(newDuration) {
    this.model.setCurrentDuration(newDuration);
    const selectedMeal = this.model.getSelectedMeal();
    if (selectedMeal) {
      const newCalories = await this.model.calculateCalories(newDuration, selectedMeal.name);
      const updates = {
        calories: newCalories,
        description: `Duration: ${newDuration} seconds`
      };
      await this.model.updateMeal(selectedMeal.id, updates);
      this.view.updateExerciseDisplay(newDuration, newCalories);
      this.view.updateMealList(this.model.getMeals());
    }
  }

  updateCaloriesDisplay() {
    const totalBurned = this.model.updateCaloriesTotal();
    this.view.updateCaloriesDisplay(totalBurned);
  }

  cleanup() {
    this.stopTimer();
    this.model.setSelectedMeal(null);
    this.model.setCurrentDuration(10);
    this.timeLeft = 0;
  }

  // **FIX 3: Improved camera and gallery operations with better error handling**
  handleCameraCapture(duration, unit, imageSrc) {
    const durationInSeconds = unit === 'minutes' ? duration * 60 : duration;
    
    // **FIX 4: Better image validation**
    if (!imageSrc || imageSrc === 'data:,' || imageSrc.length < 100) {
      this.view.showMessage('❌ Gambar tidak valid atau kosong', 'error');
      return;
    }
    
    console.log('Camera capture - Image data length:', imageSrc.length);
    console.log('Camera capture - Duration:', durationInSeconds);

    const analyzingMeal = this.model.addAnalyzingMeal({
      duration: durationInSeconds,
      image: imageSrc
    });
    
    this.view.updateMealList(this.model.getMeals());
    this.view.showMessage('📸 Gambar disimpan! Sedang menganalisis...', 'info');

    // **FIX 5: Add timeout for processing**
    setTimeout(() => {
      this.processImagePrediction(imageSrc, analyzingMeal, durationInSeconds);
    }, 500);
  }

  handleGalleryUpload(duration, unit, imageSrc) {
    const durationInSeconds = unit === 'minutes' ? duration * 60 : duration;
    
    // **FIX 6: Better image validation**
    if (!imageSrc || imageSrc === 'data:,' || imageSrc.length < 100) {
      this.view.showMessage('❌ Gambar tidak valid atau kosong', 'error');
      return;
    }
    
    console.log('Gallery upload - Image data length:', imageSrc.length);
    console.log('Gallery upload - Duration:', durationInSeconds);

    const analyzingMeal = this.model.addAnalyzingMeal({
      duration: durationInSeconds,
      image: imageSrc
    });
    
    this.view.updateMealList(this.model.getMeals());
    this.view.showMessage('🖼️ Gambar disimpan! Sedang menganalisis...', 'info');

    // **FIX 7: Add timeout for processing**
    setTimeout(() => {
      this.processImagePrediction(imageSrc, analyzingMeal, durationInSeconds);
    }, 500);
  }

  // **FIX 8: Enhanced background processing with better error handling and timeout**
  async processImagePrediction(imageSrc, analyzingMeal, durationInSeconds) {
    console.log('Starting prediction process...');
    
    // **FIX 9: Comprehensive image validation**
    if (!imageSrc || imageSrc.length < 100) {
      console.error('Image data lost or invalid');
      await this.model.deleteMeal(analyzingMeal.id);
      this.view.updateMealList(this.model.getMeals());
      this.updateCaloriesDisplay();
      this.view.showMessage('❌ Data gambar hilang', 'error');
      return;
    }

    // **FIX 10: Add processing timeout (30 seconds)**
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Prediction timeout after 30 seconds')), 30000);
    });

    try {
      // Step 1: Convert image and predict with timeout
      const predictionPromise = this.performImagePrediction(imageSrc);
      const prediction = await Promise.race([predictionPromise, timeoutPromise]);
      
      if (!prediction.success) {
        throw new Error(prediction.message || 'Prediction failed');
      }

      // Step 2: Get predicted exercise name
      const predictedName = prediction.data?.predicted_class
        ? prediction.data.predicted_class.replace(/\b\w/g, c => c.toUpperCase())
        : this.model.getRandomMealName();

      // Step 3: Calculate calories
      const calories = await this.model.calculateCalories(durationInSeconds, predictedName);

      // Step 4: Update meal with results
      const updates = {
        name: predictedName,
        calories: calories,
        finalCalories: calories,
        analyzing: false
      };
      
      await this.model.updateMeal(analyzingMeal.id, updates);
      
      // **FIX 11: Proper UI refresh sequence**
      this.view.updateMealList(this.model.getMeals());
      this.updateCaloriesDisplay();
      
      this.view.showMessage(`✅ Analisis selesai! Latihan: ${predictedName} (${calories} kkal)`, 'success');

    } catch (error) {
      console.error('Prediction error:', error);
      
      // **FIX 12: Better error handling**
      await this.model.deleteMeal(analyzingMeal.id);
      this.view.updateMealList(this.model.getMeals());
      this.updateCaloriesDisplay();
      
      let errorMessage = '❌ Gagal menganalisis gambar';
      if (error.message.includes('timeout')) {
        errorMessage += ': Timeout (> 30 detik)';
      } else if (error.message.includes('network')) {
        errorMessage += ': Masalah koneksi';
      } else {
        errorMessage += ': ' + error.message;
      }
      
      this.view.showMessage(errorMessage, 'error');
    }
  }

  // **FIX 13: Separated prediction logic for better testing and timeout handling**
  async performImagePrediction(imageSrc) {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    
    return await predictImage(imageFile);
  }

  // Utility methods
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getTargetCalories() {
    return this.model.getTargetCalories();
  }

  setTargetCalories(calories) {
    this.model.setTargetCalories(calories);
  }
}