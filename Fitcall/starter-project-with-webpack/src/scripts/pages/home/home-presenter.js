// home-presenter.js
import HomeModel from './home-model.js';

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
  async handleAddMeal(mealData) {
    try {
      const meal = this.model.addMeal(mealData);
      this.view.updateMealList(this.model.getMeals());
      this.view.showMessage('Exercise added successfully!', 'success');
      return meal;
    } catch (error) {
      this.view.showMessage('Failed to add exercise', 'error');
      console.error('Error adding meal:', error);
    }
  }

  handleDeleteMeal(id) {
    try {
      const deletedMeal = this.model.deleteMeal(id);
      if (deletedMeal) {
        this.updateCaloriesDisplay();
        this.view.updateMealList(this.model.getMeals());
        this.view.showMessage('Exercise deleted', 'info');
      }
    } catch (error) {
      this.view.showMessage('Failed to delete exercise', 'error');
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
        this.view.showMessage('Exercise completed!', 'success');
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
      this.view.showMessage('Exercise saved!', 'success');
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

  // Camera operations
  async handleCameraCapture(duration, unit, imageSrc) {
    const durationInSeconds = unit === 'minutes' ? duration * 60 : duration;
    
    if (!imageSrc || durationInSeconds < 10) {
      this.view.showMessage('Please capture an image and enter a valid duration (minimum 10 seconds).', 'error');
      return false;
    }

    const mealData = {
      duration: durationInSeconds,
      image: imageSrc
    };

    await this.handleAddMeal(mealData);
    return true;
  }

  // Gallery operations  
  async handleGalleryUpload(duration, unit, imageSrc) {
    const durationInSeconds = unit === 'minutes' ? duration * 60 : duration;
    
    if (!imageSrc || durationInSeconds < 10) {
      this.view.showMessage('Please select an image and enter a valid duration (minimum 10 seconds).', 'error');
      return false;
    }

    const mealData = {
      duration: durationInSeconds,
      image: imageSrc
    };

    await this.handleAddMeal(mealData);
    return true;
  }

  // Utility methods
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ✅ Update method ini
  getTargetCalories() {
    return this.model.getTargetCalories();
  }

    setTargetCalories(calories) {
    this.model.setTargetCalories(calories);
  }
}