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
      'Push Up': 8 / 60,
      'Jogging Session': 10 / 60,
      'Yoga Practice': 4 / 60,
      'Weight Lifting': 7 / 60,
      'Cardio Workout': 12 / 60
    };

    this.mealNames = [
      'Push Up',
      'Jogging Session',
      'Yoga Practice',
      'Weight Lifting',
      'Cardio Workout'
    ];
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

  // Meal and exercise management
  calculateCalories(duration, mealName) {
    const baseCalories = duration * (this.calorieRates[mealName] || 8 / 60);
    const randomFactor = 0.9 + Math.random() * 0.2;
    return Math.round(baseCalories * randomFactor);
  }

  addMeal(mealData) {
    const meal = {
      id: Date.now(),
      name: mealData.name || this.getRandomMealName(),
      calories: this.calculateCalories(mealData.duration, mealData.name),
      finalCalories: this.calculateCalories(mealData.duration, mealData.name),
      description: `Duration: ${mealData.duration} seconds`,
      image: mealData.image,
      completed: false,
      analyzing: mealData.analyzing || false
    };

    this.meals.push(meal);
    return meal;
  }

  // New method for adding analyzing meal
  addAnalyzingMeal(mealData) {
    const meal = {
      id: Date.now(),
      name: 'Analyzing...',
      calories: 0,
      finalCalories: 0,
      description: `Duration: ${mealData.duration} seconds`,
      image: mealData.image,
      completed: false,
      analyzing: true
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

  getTargetCalories() {
    return this.targetCalories;
  }
}