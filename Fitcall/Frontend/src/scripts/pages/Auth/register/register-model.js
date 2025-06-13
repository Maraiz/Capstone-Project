import { registerUser } from '../../../data/api.js';

export default class RegisterModel {
  constructor() {
    // Form state only - NO localStorage
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
      activityLevel: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    this.validationRules = {
      name: { min: 2, max: 50, pattern: /^[a-zA-Z\s]+$/ },
      age: { min: 13, max: 100 },
      height: { min: 100, max: 250 },
      currentWeight: { min: 30, max: 300 },
      targetWeight: { min: 30, max: 200, optional: true },
      username: { min: 3, max: 20, pattern: /^[a-zA-Z0-9_]+$/ },
      email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      password: { min: 6, max: 50 },
      confirmPassword: { min: 6, max: 50 }
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
      { value: '0.5', label: 'Turun 0,5 kg per minggu' },
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

  // ================================
  // DATA MANAGEMENT - In Memory Only
  // ================================
  
  setData(field, value) {
    if (this.registrationData.hasOwnProperty(field)) {
      this.registrationData[field] = value;
      // NO localStorage save
    }
  }

  setMultipleData(data) {
    Object.keys(data).forEach(key => {
      if (this.registrationData.hasOwnProperty(key)) {
        this.registrationData[key] = data[key];
      }
    });
    // NO localStorage save
  }

  getData() {
    return { ...this.registrationData };
  }

  getField(field) {
    return this.registrationData[field];
  }

  // ================================
  // VALIDATION METHODS
  // ================================

  validateField(field, value) {
    const rules = this.validationRules[field];
    if (!rules) return { valid: true };

    if (rules.optional && (!value || value.trim() === '')) {
      return { valid: true };
    }

    if (!value || value.toString().trim() === '') {
      return { valid: false, message: `${this.getFieldDisplayName(field)} tidak boleh kosong` };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return { valid: false, message: this.getPatternErrorMessage(field) };
    }

    const numValue = parseFloat(value);
    
    if (rules.min !== undefined && (field === 'password' || field === 'confirmPassword' || field === 'username' || field === 'name')) {
      if (value.length < rules.min) {
        return { valid: false, message: `${this.getFieldDisplayName(field)} minimal ${rules.min} karakter` };
      }
    } else if (rules.min !== undefined && numValue < rules.min) {
      return { valid: false, message: `${this.getFieldDisplayName(field)} minimal ${rules.min}` };
    }

    if (rules.max !== undefined && (field === 'password' || field === 'confirmPassword' || field === 'username' || field === 'name')) {
      if (value.length > rules.max) {
        return { valid: false, message: `${this.getFieldDisplayName(field)} maksimal ${rules.max} karakter` };
      }
    } else if (rules.max !== undefined && numValue > rules.max) {
      return { valid: false, message: `${this.getFieldDisplayName(field)} maksimal ${rules.max}` };
    }

    if (field === 'confirmPassword') {
      const password = this.registrationData.password;
      if (value !== password) {
        return { valid: false, message: 'Konfirmasi password tidak sesuai' };
      }
    }

    if (field === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return { valid: false, message: 'Format email tidak valid' };
      }
    }

    if (field === 'age') {
      const age = parseInt(value);
      if (isNaN(age)) {
        return { valid: false, message: 'Usia harus berupa angka' };
      }
    }

    if (field === 'currentWeight' || field === 'targetWeight') {
      const weight = parseFloat(value);
      if (isNaN(weight)) {
        return { valid: false, message: 'Berat badan harus berupa angka' };
      }
    }

    if (field === 'height') {
      const height = parseFloat(value);
      if (isNaN(height)) {
        return { valid: false, message: 'Tinggi badan harus berupa angka' };
      }
    }

    return { valid: true };
  }

  getFieldDisplayName(field) {
    const displayNames = {
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Konfirmasi Password',
      name: 'Nama',
      age: 'Usia',
      height: 'Tinggi badan',
      currentWeight: 'Berat badan saat ini',
      targetWeight: 'Target berat badan',
      country: 'Negara',
      gender: 'Jenis kelamin',
      weeklyTarget: 'Target mingguan',
      targetDeadline: 'Batas waktu target',
      activityLevel: 'Tingkat aktivitas'
    };
    return displayNames[field] || field;
  }

  getPatternErrorMessage(field) {
    const messages = {
      username: 'Username hanya boleh mengandung huruf, angka, dan underscore',
      email: 'Format email tidak valid',
      name: 'Nama hanya boleh mengandung huruf dan spasi'
    };
    return messages[field] || `Format ${field} tidak valid`;
  }

  getStepFields(stepNumber) {
    const stepFieldsMap = {
      1: ['name'],
      2: ['country', 'gender', 'age'],
      3: ['height', 'currentWeight', 'targetWeight'],
      4: ['weeklyTarget', 'targetDeadline'],
      5: ['activityLevel'],
      6: [],
      7: ['username', 'email', 'password', 'confirmPassword']
    };
    return stepFieldsMap[stepNumber] || [];
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

    if (stepNumber === 2) {
      const requiredFields = ['country', 'gender', 'age'];
      requiredFields.forEach(field => {
        if (!this.registrationData[field]) {
          results[field] = { valid: false, message: `${this.getFieldDisplayName(field)} harus dipilih` };
          isValid = false;
        }
      });
    }

    if (stepNumber === 4) {
      const deadline = this.registrationData.targetDeadline;
      if (deadline) {
        const selectedDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
          results.targetDeadline = { valid: false, message: 'Batas waktu harus di masa depan' };
          isValid = false;
        }
      }
    }

    return { valid: isValid, fieldResults: results };
  }

  // ================================
  // CALORIE CALCULATION
  // ================================

  calculateCalories() {
    const weight = parseFloat(this.registrationData.currentWeight);
    const height = parseFloat(this.registrationData.height);
    const age = parseInt(this.registrationData.age);
    const gender = this.registrationData.gender;
    const activityLevel = parseFloat(this.registrationData.activityLevel);
    const weeklyTarget = parseFloat(this.registrationData.weeklyTarget);

    if (!weight || !height || !age || !gender || !activityLevel || !weeklyTarget) {
      return {
        error: true,
        message: 'Data tidak lengkap untuk kalkulasi kalori'
      };
    }

    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    const tdee = bmr * activityLevel;
    const weeklyDeficit = weeklyTarget * 7700;
    const dailyDeficit = weeklyDeficit / 7;
    const targetCalories = tdee - dailyDeficit;
    const minCalories = gender === 'male' ? 1500 : 1200;
    const safeTargetCalories = Math.max(targetCalories, minCalories);

    const warnings = [];
    if (weight < 40 || weight > 250) {
      warnings.push('Berat badan di luar rentang normal');
    }
    if (height < 120 || height > 220) {
      warnings.push('Tinggi badan di luar rentang normal');
    }
    if (dailyDeficit > 1000) {
      warnings.push('Target penurunan berat terlalu agresif');
    }
    if (targetCalories < minCalories) {
      warnings.push(`Target kalori disesuaikan ke minimum aman (${minCalories} kcal)`);
    }

    let estimatedWeeks = null;
    if (this.registrationData.targetWeight) {
      const targetWeight = parseFloat(this.registrationData.targetWeight);
      const weightDifference = weight - targetWeight;
      if (weightDifference > 0) {
        estimatedWeeks = Math.ceil(weightDifference / weeklyTarget);
      }
    }

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(safeTargetCalories),
      weeklyDeficit: Math.round(weeklyDeficit),
      dailyDeficit: Math.round(dailyDeficit),
      isMinimumCalories: targetCalories < minCalories,
      warnings: warnings,
      estimatedWeeks: estimatedWeeks,
      equation: 'Mifflin-St Jeor',
      disclaimer: 'Hasil ini adalah estimasi. Konsultasi dengan ahli gizi untuk hasil yang lebih akurat.'
    };
  }

  // ================================
  // API INTEGRATION
  // ================================

  prepareRegistrationPayload() {
    const data = this.getData();
    
    const requiredFields = ['name', 'country', 'gender', 'age', 'height', 'currentWeight', 
                           'weeklyTarget', 'targetDeadline', 'activityLevel', 'username', 
                           'email', 'password', 'confirmPassword'];
    
    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        throw new Error(`Field ${field} is required`);
      }
    }
    
    return {
      name: data.name.trim(),
      country: data.country,
      gender: data.gender,
      age: parseInt(data.age),
      height: parseFloat(data.height),
      currentWeight: parseFloat(data.currentWeight),
      targetWeight: data.targetWeight ? parseFloat(data.targetWeight) : null,
      weeklyTarget: parseFloat(data.weeklyTarget),
      targetDeadline: data.targetDeadline,
      activityLevel: parseFloat(data.activityLevel),
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      confirmPassword: data.confirmPassword
    };
  }

  async submitRegistration() {
    try {
      const payload = this.prepareRegistrationPayload();
      console.log('Sending registration data:', { ...payload, password: '***', confirmPassword: '***' });
      
      const result = await registerUser(payload);
      return result;
    } catch (error) {
      console.error('Registration submission error:', error);
      
      if (error.message.includes('Field') && error.message.includes('is required')) {
        return {
          success: false,
          message: 'Mohon lengkapi semua data yang diperlukan',
          error: error
        };
      }
      
      return {
        success: false,
        message: 'Terjadi kesalahan saat memproses data',
        error: error
      };
    }
  }

  async completeRegistration() {
    try {
      const finalValidation = this.validateAllSteps();
      if (!finalValidation.valid) {
        return {
          success: false,
          message: 'Data registrasi tidak lengkap atau tidak valid',
          validationErrors: finalValidation.errors
        };
      }

      const apiResult = await this.submitRegistration();
      
      if (!apiResult.success) {
        return apiResult;
      }

      // NO localStorage save, directly return success
      return {
        success: true,
        message: apiResult.message,
        userData: apiResult.data
      };
      
    } catch (error) {
      console.error('Error completing registration:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat menyimpan data'
      };
    }
  }

  validateAllSteps() {
    const errors = {};
    let isValid = true;

    for (let step = 1; step <= 7; step++) {
      const stepValidation = this.validateStep(step);
      if (!stepValidation.valid) {
        errors[`step${step}`] = stepValidation.fieldResults;
        isValid = false;
      }
    }

    return { valid: isValid, errors };
  }

  // ================================
  // HELPER METHODS
  // ================================

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

  getMinDateString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Reset form
  resetForm() {
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
      activityLevel: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  }

  // Progress calculation
  getRegistrationProgress() {
    const totalSteps = 7;
    let completedSteps = 0;

    for (let step = 1; step <= totalSteps; step++) {
      const validation = this.validateStep(step);
      if (validation.valid) {
        completedSteps++;
      }
    }

    return {
      completedSteps,
      totalSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100)
    };
  }
}