import { setToken, getToken, getUserProfile, calculateWorkoutCalories, getAvailableExercises } from '../../data/api.js';

export default class HomeModel {
  constructor() {
    this.meals = [];
    this.totalCaloriesBurned = 0;
    this.currentDuration = 10;
    this.selectedMeal = null;
    this.targetCalories = 500;
    this.availableExercises = []; // Cache exercise list

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

    // Load available exercises when model is created
    this.loadAvailableExercises();
  }

  getToken() {
    return getToken();
  }

  async getUserData() {
    try {
      console.log('Getting user data...');
      const result = await getUserProfile();

      console.log('API result:', result);

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

  // Load available exercises from API
  async loadAvailableExercises() {
    try {
      const result = await getAvailableExercises();
      if (result.success) {
        this.availableExercises = result.data;
        console.log('Loaded exercises:', this.availableExercises);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }

  // NEW: Calculate calories using backend API
  async calculateCaloriesAPI(duration, exerciseName) {
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

  // Updated: Use API for calorie calculation
  async calculateCalories(duration, mealName) {
    const result = await this.calculateCaloriesAPI(duration, mealName);
    return result.calories;
  }

  async addMeal(mealData) {
    const meal = {
      id: Date.now(),
      name: mealData.name || this.getRandomMealName(),
      calories: 0, // Will be calculated
      finalCalories: 0,
      description: `Duration: ${mealData.duration} seconds`,
      image: mealData.image,
      completed: false,
      analyzing: mealData.analyzing || false,
      duration: mealData.duration
    };

    // Calculate calories using API if not analyzing
    if (!mealData.analyzing) {
      meal.calories = await this.calculateCalories(mealData.duration, meal.name);
      meal.finalCalories = meal.calories;
    }

    this.meals.push(meal);
    return meal;
  }

  // Updated: Add analyzing meal method
  addAnalyzingMeal(mealData) {
    const meal = {
      id: Date.now(),
      name: 'Analyzing...',
      calories: 0,
      finalCalories: 0,
      description: `Duration: ${mealData.duration} seconds`,
      image: mealData.image,
      completed: false,
      analyzing: true,
      duration: mealData.duration
    };

    this.meals.push(meal);
    return meal;
  }

  deleteMeal(id) {
    const deletedMeal = this.meals.find(meal => meal.id === id);
    if (deletedMeal && deletedMeal.completed) {
      this.totalCaloriesBurned -= deletedMeal.finalCalories;
    }
    this.meals = this.meals.filter(meal => meal.id !== id);
    return deletedMeal;
  }

  async updateMeal(id, updates) {
    const index = this.meals.findIndex(meal => meal.id === id);
    if (index !== -1) {
      // If updating name and we have duration, recalculate calories
      if (updates.name && this.meals[index].duration && !updates.analyzing) {
        updates.calories = await this.calculateCalories(this.meals[index].duration, updates.name);
        updates.finalCalories = updates.calories;
      }
      
      this.meals[index] = { ...this.meals[index], ...updates };
      return this.meals[index];
    }
    return null;
  }

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
    this.totalCaloriesBurned = this.meals.reduce((sum, meal) => sum + (meal.completed ? meal.finalCalories : 0), 0);
    return this.totalCaloriesBurned;
  }

  getTotalCaloriesBurned() {
    return this.totalCaloriesBurned;
  }

  async completeExercise(mealId, duration) {
    const index = this.meals.findIndex(meal => meal.id === mealId);
    if (index !== -1) {
      const meal = this.meals[index];
      meal.finalCalories = await this.calculateCalories(duration, meal.name);
      meal.calories = meal.finalCalories;
      meal.completed = true;
      this.totalCaloriesBurned += meal.finalCalories;
      return meal;
    }
    return null;
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

  // Get available exercises (with API fallback)
  getAvailableExercises() {
    return this.availableExercises.length > 0 ? this.availableExercises : this.mealNames.map(name => ({
      nama: this.convertToBackendFormat(name),
      met: Object.values(this.fallbackCalorieRates)[0] * 60 // Convert back to per-minute
    }));
  }
}