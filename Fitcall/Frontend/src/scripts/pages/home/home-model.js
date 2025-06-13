import { 
  setToken, 
  getToken, 
  getUserProfile, 
  calculateWorkoutCalories, 
  getAvailableExercises,
  saveWorkoutSession,
  getWorkoutSessions,
  deleteWorkoutSession,
  updateWorkoutSession
} from '../../data/api.js';

// Enhanced base64 cleaning function
function cleanBase64Image(base64String) {
  if (!base64String || typeof base64String !== 'string') {
    console.warn('Invalid base64 input:', typeof base64String);
    return null;
  }
  
  try {
    // Remove any whitespace, newlines, and extra characters
    let cleaned = base64String.trim();
    
    // Handle cases where there might be extra characters after base64
    // Look for the pattern data:image/[format];base64,[data]
    const match = cleaned.match(/^data:image\/[^;]+;base64,([A-Za-z0-9+\/=]+)/);
    if (match) {
      // Reconstruct clean base64 URL
      const imageType = cleaned.match(/^data:image\/([^;]+)/)[1];
      const base64Data = match[1];
      
      // Validate base64 data
      if (base64Data && base64Data.length > 0) {
        // Test if base64 is valid
        try {
          atob(base64Data);
          const cleanedUrl = `data:image/${imageType};base64,${base64Data}`;
          
          console.log('✅ Base64 cleaned successfully:', {
            originalLength: base64String.length,
            cleanedLength: cleanedUrl.length,
            imageType: imageType
          });
          
          return cleanedUrl;
        } catch (e) {
          console.error('❌ Invalid base64 data:', e);
          return null;
        }
      }
    } else {
      console.error('❌ Invalid base64 format:', cleaned.substring(0, 100));
      return null;
    }
  } catch (error) {
    console.error('❌ Error cleaning base64:', error);
    return null;
  }
  
  return null;
}

// Image compression function
function compressImage(base64String, maxWidth = 300, quality = 0.7) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      console.log('🖼️ Image compressed:', {
        originalSize: (base64String.length / 1024).toFixed(2) + ' KB',
        compressedSize: (compressedBase64.length / 1024).toFixed(2) + ' KB'
      });
      
      resolve(compressedBase64);
    };
    
    img.onerror = function() {
      console.error('Error loading image for compression');
      resolve(base64String); // Return original if compression fails
    };
    
    img.src = base64String;
  });
}

export default class HomeModel {
  constructor() {
    this.meals = []; // Local state for UI
    this.totalCaloriesBurned = 0;
    this.currentDuration = 10;
    this.selectedMeal = null;
    this.targetCalories = 500;
    this.availableExercises = []; // Cache exercise list
    this.currentDate = new Date(); // Current displayed date
    this.isLoading = false;
    this.isInitialized = false; // Flag to track initialization

    // Fallback calorie rates (jika API gagal)
    this.fallbackCalorieRates = {
      'push_up': 8 / 60,
      'squat': 5 / 60,
      'deadlift': 6 / 60,
      'bench_press': 6 / 60,
      'pull_up': 8 / 60,
      'plank': 3 / 60,
      'shoulder_press': 5 / 60,
      'triceps': 4.5 / 60,
      'leg_extension': 5 / 60
    };

    this.mealNames = [
      'Push Up',
      'Squat', 
      'Deadlift',
      'Bench Press',
      'Pull Up',
      'Plank',
      'Shoulder Press',
      'Triceps',
      'Leg Extension'
    ];
  }

  // ================================
  // INITIALIZATION METHODS
  // ================================

  // Initialize model after user authentication is confirmed
  async initialize() {
    if (this.isInitialized) {
      console.log('Model already initialized');
      return;
    }

    if (!this.getToken()) {
      console.log('No token available, skipping model initialization');
      return;
    }

    console.log('Initializing HomeModel with authentication...');
    
    try {
      this.isInitialized = true;
      
      // Load available exercises (doesn't require auth)
      await this.loadAvailableExercises();
      
      // Load today's workout sessions
      await this.loadWorkoutSessions();
      
      console.log('HomeModel initialized successfully');
    } catch (error) {
      console.error('Error initializing HomeModel:', error);
      this.isInitialized = false;
    }
  }

  // Reset model state (for logout)
  reset() {
    console.log('Resetting HomeModel state...');
    this.meals = [];
    this.totalCaloriesBurned = 0;
    this.selectedMeal = null;
    this.availableExercises = [];
    this.isInitialized = false;
    this.isLoading = false;
  }

  // ================================
  // AUTH & USER DATA METHODS
  // ================================

  getToken() {
    return getToken();
  }

  async getUserData() {
    if (!this.getToken()) {
      console.log('No token available for getUserData');
      return null;
    }

    try {
      console.log('Getting user data...');
      const result = await getUserProfile();

      if (result.success && result.data) {
        return result.data;
      }

      console.log('Failed to get user data:', result.message);
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  clearAuth() {
    setToken(null);
    this.reset(); // Reset model state when clearing auth
  }

  async getUserStats() {
    const userData = await this.getUserData();
    if (!userData) return null;

    return {
      name: userData.name,
      email: userData.email,
      targetCalories: userData.targetCalories || 0,
      currentWeight: userData.currentWeight || 0,
      targetWeight: userData.targetWeight || 0,
      weeklyTarget: userData.weeklyTarget || 0,
      height: userData.height || 0,
      age: userData.age || 0,
      gender: userData.gender || '',
      activityLevel: userData.activityLevel || 0,
      username: userData.username || '',
      country: userData.country || ''
    };
  }

  // ================================
  // EXERCISE & CALORIE METHODS
  // ================================

  // Load available exercises from API (no auth required)
  async loadAvailableExercises() {
    try {
      console.log('Loading available exercises...');
      const result = await getAvailableExercises();
      if (result.success) {
        this.availableExercises = result.data;
        console.log('Loaded exercises:', this.availableExercises.length);
      } else {
        console.log('Failed to load exercises:', result.message);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }

  // Calculate calories using backend API
  async calculateCaloriesAPI(duration, exerciseName) {
    if (!this.getToken()) {
      console.log('No token for calorie calculation, using fallback');
      return {
        success: false,
        calories: this.calculateCaloriesFallback(duration, exerciseName),
        error: 'No authentication token'
      };
    }

    try {
      // Konversi nama exercise ke format backend
      const backendExerciseName = this.convertToBackendFormat(exerciseName);
      
      console.log('Calculating calories for:', {
        gerakan: backendExerciseName,
        durasi: Math.round(duration / 60) // Convert to minutes
      });

      const result = await calculateWorkoutCalories({
        gerakan: backendExerciseName,
        durasi: Math.round(duration / 60) // Backend expects minutes
      });

      if (result.success) {
        console.log('API calculation result:', result.data);
        return {
          success: true,
          calories: result.data.kaloriTerbakar,
          bmr: result.data.bmr,
          userData: result.data
        };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('API calculation failed, using fallback:', error);
      
      // Fallback to local calculation
      const fallbackCalories = this.calculateCaloriesFallback(duration, exerciseName);
      return {
        success: false,
        calories: fallbackCalories,
        error: error.message
      };
    }
  }

  // Fallback calculation method
  calculateCaloriesFallback(duration, exerciseName) {
    const exerciseKey = this.convertToBackendFormat(exerciseName);
    const baseCalories = duration * (this.fallbackCalorieRates[exerciseKey] || 8 / 60);
    const randomFactor = 0.9 + Math.random() * 0.2;
    return Math.round(baseCalories * randomFactor);
  }

  // Convert exercise name to backend format
  convertToBackendFormat(exerciseName) {
    const nameMap = {
      'Push Up': 'push_up',
      'Squat': 'squat',
      'Deadlift': 'deadlift',
      'Bench Press': 'bench_press',
      'Pull Up': 'pull_up',
      'Plank': 'plank',
      'Shoulder Press': 'shoulder_press',
      'Triceps': 'triceps',
      'Leg Extension': 'leg_extension',
      'Jogging Session': 'push_up', // Map to closest available
      'Yoga Practice': 'plank',
      'Weight Lifting': 'deadlift',
      'Cardio Workout': 'push_up'
    };

    return nameMap[exerciseName] || exerciseName.toLowerCase().replace(/\s+/g, '_');
  }

  // Use API for calorie calculation
  async calculateCalories(duration, mealName) {
    const result = await this.calculateCaloriesAPI(duration, mealName);
    return result.calories;
  }

  // Get available exercises (with API fallback)
  getAvailableExercises() {
    return this.availableExercises.length > 0 ? this.availableExercises : this.mealNames.map(name => ({
      nama: this.convertToBackendFormat(name),
      met: Object.values(this.fallbackCalorieRates)[0] * 60 // Convert back to per-minute
    }));
  }

  // ================================
  // DATABASE INTEGRATION METHODS
  // ================================

  // Load workout sessions from database for specific date
  async loadWorkoutSessions(date = null) {
    if (!this.getToken()) {
      console.log('No token available for loading workout sessions');
      this.meals = [];
      return;
    }

    try {
      this.isLoading = true;
      const params = {};
      
      const targetDate = date || this.currentDate;
      params.date = targetDate.toISOString().split('T')[0];

      console.log('Loading workout sessions for date:', params.date);

      const result = await getWorkoutSessions(params);
      if (result.success && result.data) {
        // Convert database sessions to local meal format
        this.meals = result.data.map(session => ({
          id: `session_${session.id}`,
          name: session.predictedExercise || session.exerciseName,
          calories: Math.round(session.caloriesBurned),
          finalCalories: Math.round(session.caloriesBurned),
          description: `Duration: ${session.duration} seconds`,
          image: session.exerciseImage || this.getDefaultImage(),
          completed: session.status === 'completed',
          analyzing: session.status === 'analyzing',
          duration: session.duration,
          sessionId: session.id,
          workoutDate: session.workoutDate,
          workoutTime: session.workoutTime,
          bmr: session.bmr,
          notes: session.notes,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }));
        
        this.updateCaloriesTotal();
        console.log(`Loaded ${this.meals.length} workout sessions for ${params.date}`);
      } else {
        console.log('No workout sessions found:', result.message || 'Empty result');
        this.meals = [];
      }
    } catch (error) {
      console.error('Error loading workout sessions:', error);
      this.meals = [];
    } finally {
      this.isLoading = false;
    }
  }

  // Save workout session to database
  async saveWorkoutToDatabase(meal) {
    if (!this.getToken()) {
      console.log('No token available for saving workout');
      return null;
    }

    try {
      // Clean and validate image
      let exerciseImage = null;
      if (meal.image && meal.image !== this.getDefaultImage()) {
        const cleanedImage = cleanBase64Image(meal.image);
        if (cleanedImage) {
          // Compress if large
          if (cleanedImage.length > 100000) { // 100KB
            console.log('🔄 Compressing large image...');
            exerciseImage = await compressImage(cleanedImage, 250, 0.6);
          } else {
            exerciseImage = cleanedImage;
          }
        } else {
          console.warn('Invalid image data, will save without image');
          exerciseImage = null;
        }
      }

      const sessionData = {
        exerciseName: meal.name,
        predictedExercise: meal.name,
        duration: meal.duration,
        caloriesBurned: meal.finalCalories || meal.calories,
        exerciseImage: exerciseImage, // Use validated image or null
        status: meal.completed ? 'completed' : (meal.analyzing ? 'analyzing' : 'saved'),
        workoutDate: this.currentDate.toISOString().split('T')[0],
        notes: meal.notes || null
      };

      console.log('💾 Saving workout:', {
        name: sessionData.exerciseName,
        date: sessionData.workoutDate,
        hasImage: !!exerciseImage,
        imageSize: exerciseImage ? (exerciseImage.length / 1024).toFixed(2) + ' KB' : '0 KB'
      });

      const result = await saveWorkoutSession(sessionData);
      if (result.success) {
        meal.sessionId = result.data.id;
        meal.id = `session_${result.data.id}`;
        meal.createdAt = result.data.createdAt;
        meal.updatedAt = result.data.updatedAt;
        // Update local image with validated version
        if (exerciseImage) {
          meal.image = exerciseImage;
        }
        
        console.log('✅ Workout saved with ID:', result.data.id);
        return result.data;
      } else {
        console.error('❌ Failed to save workout:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error saving workout to database:', error);
      throw error;
    }
  }

  // Update workout session in database
  async updateWorkoutInDatabase(meal) {
    if (!this.getToken()) {
      console.log('No token available for updating workout');
      return null;
    }

    try {
      if (!meal.sessionId) {
        console.log('No sessionId, saving new workout instead');
        return await this.saveWorkoutToDatabase(meal);
      }

      const updateData = {
        exerciseName: meal.name,
        duration: meal.duration,
        caloriesBurned: meal.finalCalories || meal.calories,
        status: meal.completed ? 'completed' : (meal.analyzing ? 'analyzing' : 'saved'),
        notes: meal.notes || null
      };

      console.log('Updating workout in database:', meal.sessionId, updateData);

      const result = await updateWorkoutSession(meal.sessionId, updateData);
      if (result.success) {
        meal.updatedAt = result.data.updatedAt;
        console.log('Workout updated in database:', meal.sessionId);
        return result.data;
      } else {
        console.error('Failed to update workout:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error updating workout in database:', error);
      throw error;
    }
  }

  // Delete workout session from database
  async deleteWorkoutFromDatabase(sessionId) {
    if (!this.getToken()) {
      console.log('No token available for deleting workout');
      return false;
    }

    try {
      if (!sessionId) {
        console.log('No sessionId provided for deletion');
        return false;
      }

      console.log('Deleting workout from database:', sessionId);

      const result = await deleteWorkoutSession(sessionId);
      if (result.success) {
        console.log('Workout deleted from database:', sessionId);
        return true;
      } else {
        console.error('Failed to delete workout:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error deleting workout from database:', error);
      return false;
    }
  }

  // ================================
  // MEAL/WORKOUT MANAGEMENT METHODS
  // ================================

  // Add meal with database integration
  async addMeal(mealData) {
    const meal = {
      id: `temp_${Date.now()}`, // Temporary local ID
      name: mealData.name || this.getRandomMealName(),
      calories: 0, // Will be calculated
      finalCalories: 0,
      description: `Duration: ${mealData.duration} seconds`,
      image: mealData.image || this.getDefaultImage(),
      completed: false,
      analyzing: mealData.analyzing || false,
      duration: mealData.duration,
      sessionId: null,
      notes: mealData.notes || null,
      workoutDate: this.currentDate.toISOString().split('T')[0]
    };

    // Calculate calories using API if not analyzing
    if (!mealData.analyzing) {
      try {
        meal.calories = await this.calculateCalories(mealData.duration, meal.name);
        meal.finalCalories = meal.calories;
      } catch (error) {
        console.error('Error calculating calories:', error);
        meal.calories = this.calculateCaloriesFallback(mealData.duration, meal.name);
        meal.finalCalories = meal.calories;
      }
    }

    this.meals.push(meal);
    
    // Save to database in background (don't wait) - only if authenticated
    if (!mealData.analyzing && this.getToken()) {
      this.saveWorkoutToDatabase(meal).catch(error => {
        console.error('Background save failed:', error);
        // Could show a warning to user that offline mode is active
      });
    }
    
    return meal;
  }

  // Add analyzing meal (temporary, will be updated when analysis complete)
  addAnalyzingMeal(mealData) {
    const meal = {
      id: `analyzing_${Date.now()}`,
      name: 'Analyzing...',
      calories: 0,
      finalCalories: 0,
      description: `Duration: ${mealData.duration} seconds`,
      image: mealData.image || this.getDefaultImage(),
      completed: false,
      analyzing: true,
      duration: mealData.duration,
      sessionId: null,
      notes: null,
      workoutDate: this.currentDate.toISOString().split('T')[0]
    };

    this.meals.push(meal);
    return meal;
  }

  // Delete meal with database integration
  async deleteMeal(id) {
    const deletedMeal = this.meals.find(meal => meal.id === id);
    if (!deletedMeal) {
      console.log('Meal not found for deletion:', id);
      return null;
    }

    // Remove from local state first
    if (deletedMeal.completed) {
      this.totalCaloriesBurned -= deletedMeal.finalCalories;
    }
    this.meals = this.meals.filter(meal => meal.id !== id);

    // Delete from database if it has sessionId and we're authenticated
    if (deletedMeal.sessionId && this.getToken()) {
      try {
        await this.deleteWorkoutFromDatabase(deletedMeal.sessionId);
      } catch (error) {
        console.error('Error deleting from database:', error);
        // Could re-add to local state or show error message
      }
    }
    
    return deletedMeal;
  }

  // Update meal with database integration
  async updateMeal(id, updates) {
    const index = this.meals.findIndex(meal => meal.id === id);
    if (index === -1) {
      console.log('Meal not found for update:', id);
      return null;
    }

    const meal = this.meals[index];

    // If updating name and we have duration, recalculate calories
    if (updates.name && meal.duration && !updates.analyzing) {
      try {
        updates.calories = await this.calculateCalories(meal.duration, updates.name);
        updates.finalCalories = updates.calories;
      } catch (error) {
        console.error('Error recalculating calories:', error);
        updates.calories = this.calculateCaloriesFallback(meal.duration, updates.name);
        updates.finalCalories = updates.calories;
      }
    }
    
    // Update local state
    this.meals[index] = { ...meal, ...updates };
    
    // Update in database if not analyzing and authenticated
    if (!this.meals[index].analyzing && this.getToken()) {
      try {
        await this.updateWorkoutInDatabase(this.meals[index]);
      } catch (error) {
        console.error('Error updating in database:', error);
        // Could show warning about offline mode
      }
    }
    
    return this.meals[index];
  }

  // Complete exercise with database integration
  async completeExercise(mealId, duration) {
    const index = this.meals.findIndex(meal => meal.id === mealId);
    if (index === -1) {
      console.log('Meal not found for completion:', mealId);
      return null;
    }

    const meal = this.meals[index];
    
    try {
      meal.finalCalories = await this.calculateCalories(duration, meal.name);
    } catch (error) {
      console.error('Error calculating final calories:', error);
      meal.finalCalories = this.calculateCaloriesFallback(duration, meal.name);
    }
    
    meal.calories = meal.finalCalories;
    meal.completed = true;
    meal.duration = duration;
    meal.description = `Duration: ${duration} seconds`;
    this.totalCaloriesBurned += meal.finalCalories;
    
    // Update in database if authenticated
    if (this.getToken()) {
      try {
        await this.updateWorkoutInDatabase(meal);
      } catch (error) {
        console.error('Error updating completed exercise in database:', error);
        // Still return the meal, but could show warning
      }
    }
    
    return meal;
  }

  // ================================
  // UTILITY & GETTER/SETTER METHODS
  // ================================

  getMeals() {
    return this.meals;
  }

  getMealById(id) {
    return this.meals.find(meal => meal.id === id);
  }

  setSelectedMeal(meal) {
    this.selectedMeal = meal;
  }

  getSelectedMeal() {
    return this.selectedMeal;
  }

  setCurrentDuration(duration) {
    this.currentDuration = Math.max(10, Math.min(duration, 86400));
  }

  getCurrentDuration() {
    return this.currentDuration;
  }

  updateCaloriesTotal() {
    this.totalCaloriesBurned = this.meals.reduce((sum, meal) => {
      return sum + (meal.completed ? meal.finalCalories : 0);
    }, 0);
    return this.totalCaloriesBurned;
  }

  getTotalCaloriesBurned() {
    return this.totalCaloriesBurned;
  }

  getRandomMealName() {
    return this.mealNames[Math.floor(Math.random() * this.mealNames.length)];
  }

  setTargetCalories(calories) {
    this.targetCalories = calories || 500;
  }

  getTargetCalories() {
    return this.targetCalories;
  }

  // ================================
  // DATE MANAGEMENT METHODS
  // ================================

  // Set current date and reload sessions for that date
  async setCurrentDate(date) {
    if (!date || !(date instanceof Date)) {
      console.error('Invalid date provided to setCurrentDate');
      return;
    }
    
    console.log('Setting current date to:', date.toISOString().split('T')[0]);
    this.currentDate = new Date(date);
    
    // **FIX: Always reload sessions when date changes, ONLY if initialized**
    if (this.isInitialized) {
      await this.loadWorkoutSessions(this.currentDate);
    }
  }

  getCurrentDate() {
    return this.currentDate;
  }

  // Check if current date is today
  isToday() {
    const today = new Date();
    return this.currentDate.toDateString() === today.toDateString();
  }

  // Get formatted date string
  getFormattedDate() {
    return this.currentDate.toISOString().split('T')[0];
  }

  // ================================
  // HELPER METHODS
  // ================================

  // Get default image for exercises
  getDefaultImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+V29ya291dDwvdGV4dD48dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
  }

  // Check if model is currently loading data
  isDataLoading() {
    return this.isLoading;
  }

  // Check if model is initialized
  isModelInitialized() {
    return this.isInitialized;
  }

  // Get workout summary for current date
  getWorkoutSummary() {
    const completedWorkouts = this.meals.filter(meal => meal.completed);
    const totalDuration = completedWorkouts.reduce((sum, meal) => sum + meal.duration, 0);
    const uniqueExercises = [...new Set(completedWorkouts.map(meal => meal.name))];

    return {
      totalWorkouts: completedWorkouts.length,
      totalCalories: this.totalCaloriesBurned,
      totalDuration: totalDuration,
      totalDurationMinutes: Math.round(totalDuration / 60),
      uniqueExercises: uniqueExercises.length,
      exerciseTypes: uniqueExercises,
      date: this.getFormattedDate(),
      isToday: this.isToday()
    };
  }

  // Clean up analyzing meals (remove stuck analyzing states)
  cleanupAnalyzingMeals() {
    const stuckAnalyzing = this.meals.filter(meal => 
      meal.analyzing && 
      meal.createdAt && 
      (Date.now() - new Date(meal.createdAt).getTime()) > 300000 // 5 minutes
    );

    stuckAnalyzing.forEach(meal => {
      console.log('Cleaning up stuck analyzing meal:', meal.id);
      this.deleteMeal(meal.id);
    });

    return stuckAnalyzing.length;
  }

  // Refresh data (reload from database)
  async refreshData() {
    if (!this.getToken()) {
      console.log('No token available for refresh');
      return;
    }
    
    console.log('Refreshing workout data...');
    await this.loadWorkoutSessions(this.currentDate);
    this.cleanupAnalyzingMeals();
  }

  // Get statistics for date range (could be used for charts)
  async getDateRangeStats(startDate, endDate) {
    if (!this.getToken()) {
      return { success: false, message: 'No authentication token' };
    }

    try {
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const result = await getWorkoutSessions(params);
      if (result.success) {
        return {
          sessions: result.data,
          statistics: result.statistics,
          success: true
        };
      }
      return { success: false, message: result.message };
    } catch (error) {
      console.error('Error getting date range stats:', error);
      return { success: false, message: error.message };
    }
  }  
}