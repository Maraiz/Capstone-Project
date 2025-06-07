// home-model.js
import { setToken, getToken } from '../../data/api.js';

export default class HomeModel {
  getToken() {
    return getToken();
  }

  getUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  setUserData(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  updateUserData(updates) {
    const currentData = this.getUserData() || {};
    const updatedData = { ...currentData, ...updates };
    this.setUserData(updatedData);
    return updatedData;
  }

  clearAuth() {
    setToken(null);
    localStorage.removeItem('user');
  }

  // Method untuk mendapatkan statistik user
  getUserStats() {
    const userData = this.getUserData();
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
      activityLevel: userData.activityLevel || 0
    };
  }
}