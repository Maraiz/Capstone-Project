import HomeModel from './home-model.js';
import { predictImage } from '../../data/api.js';

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.model = new HomeModel();
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
    this.model.clearAuth();
    this.view.showMessage('Logout berhasil! Mengalihkan ke halaman awal...', 'success');
    setTimeout(() => {
      window.location.hash = '/';
    }, 1500);
  }

  // Meal operations
  async handleAddMeal(mealData, predictedName) {
    try {
      const meal = this.model.addMeal({ ...mealData, name: predictedName });
      this.view.updateMealList(this.model.getMeals());
      this.view.showMessage(`Latihan ${predictedName} berhasil ditambahkan!`, 'success');
      return meal;
    } catch (error) {
      this.view.showMessage('Gagal menambahkan latihan', 'error');
      console.error('Error adding meal:', error);
    }
  }

  handleDeleteMeal(id) {
    try {
      const deletedMeal = this.model.deleteMeal(id);
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

  handleCompleteExercise() {
    const selectedMeal = this.model.getSelectedMeal();
    if (selectedMeal) {
      const completedMeal = this.model.completeExercise(selectedMeal.id, this.model.getCurrentDuration());
      if (completedMeal) {
        this.updateCaloriesDisplay();
        this.view.updateMealList(this.model.getMeals());
        this.view.showMessage('Latihan selesai!', 'success');
      }
    }
    this.cleanup();
  }

  handleSaveExercise() {
    const selectedMeal = this.model.getSelectedMeal();
    if (selectedMeal) {
      const updates = {
        finalCalories: this.model.calculateCalories(this.model.getCurrentDuration(), selectedMeal.name),
        description: `Duration: ${this.model.getCurrentDuration()} seconds`
      };
      updates.calories = updates.finalCalories;
      
      this.model.updateMeal(selectedMeal.id, updates);
      this.view.updateMealList(this.model.getMeals());
      this.view.showMessage('Latihan disimpan!', 'success');
    }
    this.cleanup();
  }

  handleDurationChange(newDuration) {
    this.model.setCurrentDuration(newDuration);
    const selectedMeal = this.model.getSelectedMeal();
    if (selectedMeal) {
      const updates = {
        calories: this.model.calculateCalories(newDuration, selectedMeal.name),
        description: `Duration: ${newDuration} seconds`
      };
      this.model.updateMeal(selectedMeal.id, updates);
      this.view.updateExerciseDisplay(newDuration, updates.calories);
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

  // Camera operations - langsung tutup modal
  handleCameraCapture(duration, unit, imageSrc) {
    const durationInSeconds = unit === 'minutes' ? duration * 60 : duration;

    // Simpan gambar dulu ke variable lokal
    const imageData = imageSrc;
    
    console.log('Camera capture - Image data length:', imageData.length);
    console.log('Camera capture - Duration:', durationInSeconds);

    // Show analyzing state immediately dengan gambar yang sudah disimpan
    const analyzingMeal = this.model.addAnalyzingMeal({
      duration: durationInSeconds,
      image: imageData  // Pastikan gambar tersimpan
    });
    
    this.view.updateMealList(this.model.getMeals());
    this.view.showMessage('📸 Gambar disimpan! Sedang menganalisis...', 'info');

    // Start background prediction dengan delay kecil
    setTimeout(() => {
      this.processImagePrediction(imageData, analyzingMeal, durationInSeconds);
    }, 500);
  }

  // Gallery operations - langsung tutup modal
  handleGalleryUpload(duration, unit, imageSrc) {
    const durationInSeconds = unit === 'minutes' ? duration * 60 : duration;

    // Simpan gambar dulu ke variable lokal
    const imageData = imageSrc;
    
    console.log('Gallery upload - Image data length:', imageData.length);
    console.log('Gallery upload - Duration:', durationInSeconds);

    // Show analyzing state immediately dengan gambar yang sudah disimpan
    const analyzingMeal = this.model.addAnalyzingMeal({
      duration: durationInSeconds,
      image: imageData  // Pastikan gambar tersimpan
    });
    
    this.view.updateMealList(this.model.getMeals());
    this.view.showMessage('🖼️ Gambar disimpan! Sedang menganalisis...', 'info');

    // Start background prediction dengan delay kecil
    setTimeout(() => {
      this.processImagePrediction(imageData, analyzingMeal, durationInSeconds);
    }, 500);
  }

  // Background processing method
  processImagePrediction(imageSrc, analyzingMeal, durationInSeconds) {
    console.log('Starting prediction process...');
    console.log('Image source length:', imageSrc ? imageSrc.length : 'No image');
    
    // Validasi gambar masih ada
    if (!imageSrc || imageSrc.length < 100) {
      console.error('Image data lost or invalid');
      this.model.deleteMeal(analyzingMeal.id);
      this.view.updateMealList(this.model.getMeals());
      this.view.showMessage('❌ Data gambar hilang', 'error');
      return;
    }

    fetch(imageSrc)
      .then(response => {
        console.log('Fetch response status:', response.status);
        return response.blob();
      })
      .then(blob => {
        console.log('Blob size:', blob.size);
        const imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        console.log('Created file:', imageFile.name, imageFile.size);
        return predictImage(imageFile);
      })
      .then(prediction => {
        console.log('Prediction result:', prediction);
        
        if (!prediction.success) {
          throw new Error(prediction.message);
        }

        const predictedName = prediction.data?.predicted_class
          ? prediction.data.predicted_class.replace(/\b\w/g, c => c.toUpperCase())
          : this.model.getRandomMealName();

        const updates = {
          name: predictedName,
          calories: this.model.calculateCalories(durationInSeconds, predictedName),
          analyzing: false
        };
        
        this.model.updateMeal(analyzingMeal.id, updates);
        this.view.updateMealList(this.model.getMeals());
        this.view.showMessage(`✅ Analisis selesai! Latihan terdeteksi: ${predictedName}`, 'success');
      })
      .catch(error => {
        console.error('Prediction error:', error);
        this.model.deleteMeal(analyzingMeal.id);
        this.view.updateMealList(this.model.getMeals());
        this.view.showMessage('❌ Gagal menganalisis gambar: ' + error.message, 'error');
      });
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