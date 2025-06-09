// home-model.js
import { setToken, getToken, getUserProfile } from '../../data/api.js';

export default class HomeModel {
  constructor() {
    this.meals = [];
    this.totalCaloriesBurned = 0;
    this.currentDuration = 10;
    this.selectedMeal = null;
    this.targetCalories = 500;

    // Calorie burn rates per second (converted from per-minute rates)
    this.calorieRates = {
      'Jogging Session': 10 / 60,
      'Yoga Practice': 4 / 60,
      'Weight Lifting': 7 / 60,
      'Cardio Workout': 12 / 60,
      'HIIT Training': 15 / 60,
      'Cycling Session': 8 / 60,
      'Bodyweight Circuit': 10 / 60,
      'Strength Training': 6 / 60,
      'Loncat Bintang': 8 / 60
    };

    this.mealNames = [
      'Jogging Session',
      'Yoga Practice',
      'Weight Lifting',
      'Cardio Workout',
      'HIIT Training',
      'Cycling Session',
      'Bodyweight Circuit',
      'Strength Training',
      'Loncat Bintang'
    ];
  }

  getToken() {
    return getToken();
  }

  async getUserData() {
    try {
      console.log('Getting user data...'); // Debug log
      const result = await getUserProfile();

      console.log('API result:', result); // Debug log

      if (result.success && result.data) {
        // Backend sekarang return single object, bukan array
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

  // Meal and exercise management
  calculateCalories(duration, mealName) {
    const baseCalories = duration * this.calorieRates[mealName];
    // Add 10% randomization for realism
    const randomFactor = 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
    return Math.round(baseCalories * randomFactor);
  }

  addMeal(mealData) {
    const randomName = this.mealNames[Math.floor(Math.random() * this.mealNames.length)];
    const initialCalories = this.calculateCalories(mealData.duration, randomName);

    const meal = {
      id: Date.now(),
      name: randomName,
      calories: initialCalories,
      finalCalories: initialCalories,
      description: `Duration: ${mealData.duration} seconds`,
      image: mealData.image,
      completed: false
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

  updateMeal(id, updates) {
    const index = this.meals.findIndex(meal => meal.id === id);
    if (index !== -1) {
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

  completeExercise(mealId, duration) {
    const index = this.meals.findIndex(meal => meal.id === mealId);
    if (index !== -1) {
      const meal = this.meals[index];
      meal.finalCalories = this.calculateCalories(duration, meal.name);
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

  // ✅ Tambahkan method untuk get target calories
  getTargetCalories() {
    return this.targetCalories;
  }
}