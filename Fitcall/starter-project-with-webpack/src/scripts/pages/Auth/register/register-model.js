export default class RegisterModel {
  constructor() {
    this.registrationData = {
      name: '',
      country: '',
      gender: '',
      age: '',
      targetWeight: '',
      height: '',
      currentWeight: '',
      weeklyTarget: '',
      targetDeadline: '',
      activityLevel: ''
    };
    
    this.validationRules = {
      name: { min: 2, max: 50, pattern: /^[a-zA-Z\s]+$/ },
      age: { min: 13, max: 100 },
      height: { min: 100, max: 250 },
      currentWeight: { min: 30, max: 300 },
      targetWeight: { min: 30, max: 200, optional: true }
    };
    
    this.countries = [
      { value: 'indonesia', label: 'Indonesia' },
      { value: 'malaysia', label: 'Malaysia' },
      { value: 'singapore', label: 'Singapore' },
      { value: 'thailand', label: 'Thailand' },
      { value: 'philippines', label: 'Philippines' },
      { value: 'vietnam', label: 'Vietnam' }
    ];
    
    this.weeklyTargets = [
      { value: '0.25', label: 'Turun 0,25 kg per minggu' },
      { value: '1', label: 'Turun 1 kg per minggu' }
    ];
    
    this.activityLevels = [
      {
        value: '1.2',
        title: 'Tidak Aktif',
        description: 'Jarang atau tidak pernah berolahraga, sebagian besar waktu duduk',
        multiplier: 'BMR × 1.2'
      },
      {
        value: '1.375',
        title: 'Sedikit Aktif',
        description: 'Olahraga ringan 1-3 hari per minggu',
        multiplier: 'BMR × 1.375'
      },
      {
        value: '1.55',
        title: 'Cukup Aktif',
        description: 'Olahraga sedang 3-5 hari per minggu',
        multiplier: 'BMR × 1.55'
      },
      {
        value: '1.725',
        title: 'Sangat Aktif',
        description: 'Olahraga berat 6-7 hari per minggu',
        multiplier: 'BMR × 1.725'
      },
      {
        value: '1.9',
        title: 'Ekstra Aktif',
        description: 'Olahraga sangat berat, pekerjaan fisik, atau 2x sehari',
        multiplier: 'BMR × 1.9'
      }
    ];
  }

  // Data Management
  setData(field, value) {
    if (this.registrationData.hasOwnProperty(field)) {
      this.registrationData[field] = value;
      this.saveToStorage();
    }
  }

  setMultipleData(data) {
    Object.keys(data).forEach(key => {
      if (this.registrationData.hasOwnProperty(key)) {
        this.registrationData[key] = data[key];
      }
    });
    this.saveToStorage();
  }

  getData() {
    return { ...this.registrationData };
  }

  getField(field) {
    return this.registrationData[field];
  }

  // Validation Methods
  validateField(field, value) {
    const rules = this.validationRules[field];
    if (!rules) return { valid: true };

    if (rules.optional && (!value || value.trim() === '')) {
      return { valid: true };
    }

    if (!value || value.toString().trim() === '') {
      return { valid: false, message: `${field} tidak boleh kosong` };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return { valid: false, message: `Format ${field} tidak valid` };
    }

    const numValue = parseFloat(value);
    if (rules.min !== undefined && numValue < rules.min) {
      return { valid: false, message: `${field} minimal ${rules.min}` };
    }

    if (rules.max !== undefined && numValue > rules.max) {
      return { valid: false, message: `${field} maksimal ${rules.max}` };
    }

    return { valid: true };
  }

  validateStep(stepNumber) {
    const stepFields = this.getStepFields(stepNumber);
    const results = {};
    let isValid = true;

    stepFields.forEach(field => {
      const value = this.registrationData[field];
      const validation = this.validateField(field, value);
      results[field] = validation;
      if (!validation.valid) isValid = false;
    });

    return { valid: isValid, fieldResults: results };
  }

  getStepFields(stepNumber) {
    const stepFieldsMap = {
      1: ['name'],
      2: ['country', 'gender', 'age'],
      3: ['height', 'currentWeight', 'targetWeight'],
      4: ['weeklyTarget', 'targetDeadline'],
      5: ['activityLevel']
    };
    return stepFieldsMap[stepNumber] || [];
  }

  // Calorie Calculation
  calculateCalories() {
    const weight = parseFloat(this.registrationData.currentWeight);
    const height = parseFloat(this.registrationData.height);
    const age = parseInt(this.registrationData.age);
    const gender = this.registrationData.gender;
    const activityLevel = parseFloat(this.registrationData.activityLevel);
    const weeklyTarget = parseFloat(this.registrationData.weeklyTarget);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Calculate TDEE
    const tdee = bmr * activityLevel;

    // Calculate deficit (1 kg fat = 7700 calories)
    const weeklyDeficit = weeklyTarget * 7700;
    const dailyDeficit = weeklyDeficit / 7;

    // Target calories with safety minimum
    const targetCalories = tdee - dailyDeficit;
    const minCalories = gender === 'male' ? 1500 : 1200;
    const safeTargetCalories = Math.max(targetCalories, minCalories);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(safeTargetCalories),
      weeklyDeficit: Math.round(weeklyDeficit),
      dailyDeficit: Math.round(dailyDeficit),
      isMinimumCalories: targetCalories < minCalories
    };
  }

  // Storage Management
  saveToStorage() {
    try {
      localStorage.setItem('registrationData', JSON.stringify(this.registrationData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('registrationData');
      if (data) {
        this.registrationData = { ...this.registrationData, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  clearStorage() {
    try {
      localStorage.removeItem('registrationData');
      this.registrationData = {
        name: '',
        country: '',
        gender: '',
        age: '',
        targetWeight: '',
        height: '',
        currentWeight: '',
        weeklyTarget: '',
        targetDeadline: '',
        activityLevel: ''
      };
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Complete Registration
  completeRegistration() {
    const results = this.calculateCalories();
    const completeProfile = {
      ...this.registrationData,
      calories: results,
      registrationComplete: true,
      registrationDate: new Date().toISOString()
    };

    try {
      localStorage.setItem('userProfile', JSON.stringify(completeProfile));
      this.clearStorage();
      return true;
    } catch (error) {
      console.error('Error completing registration:', error);
      return false;
    }
  }

  // Helper Methods
  getCountries() {
    return this.countries;
  }

  getWeeklyTargets() {
    return this.weeklyTargets;
  }

  getActivityLevels() {
    return this.activityLevels;
  }

  getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }
}