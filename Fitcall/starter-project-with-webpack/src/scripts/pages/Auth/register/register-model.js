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
    return { valid: false, message: `${this.getFieldDisplayName(field)} tidak boleh kosong` };
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return { valid: false, message: this.getPatternErrorMessage(field) };
  }

  const numValue = parseFloat(value);
  if (rules.min !== undefined && (field === 'password' || field === 'confirmPassword' || field === 'username')) {
    if (value.length < rules.min) {
      return { valid: false, message: `${this.getFieldDisplayName(field)} minimal ${rules.min} karakter` };
    }
  } else if (rules.min !== undefined && numValue < rules.min) {
    return { valid: false, message: `${this.getFieldDisplayName(field)} minimal ${rules.min}` };
  }

  if (rules.max !== undefined && (field === 'password' || field === 'confirmPassword' || field === 'username')) {
    if (value.length > rules.max) {
      return { valid: false, message: `${this.getFieldDisplayName(field)} maksimal ${rules.max} karakter` };
    }
  } else if (rules.max !== undefined && numValue > rules.max) {
    return { valid: false, message: `${this.getFieldDisplayName(field)} maksimal ${rules.max}` };
  }

  // Validasi khusus untuk confirm password
  if (field === 'confirmPassword') {
    const password = this.registrationData.password;
    if (value !== password) {
      return { valid: false, message: 'Konfirmasi password tidak sesuai' };
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
    currentWeight: 'Berat badan',
    targetWeight: 'Target berat badan'
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
    6: [], // Step 6 tidak ada validasi field
    7: ['username', 'email', 'password', 'confirmPassword']
  };
  return stepFieldsMap[stepNumber] || [];
}


  // Calorie Calculation
  // Calorie Calculation - FIXED VERSION
  calculateCalories() {
    const weight = parseFloat(this.registrationData.currentWeight);
    const height = parseFloat(this.registrationData.height);
    const age = parseInt(this.registrationData.age);
    const gender = this.registrationData.gender;
    const activityLevel = parseFloat(this.registrationData.activityLevel);
    const weeklyTarget = parseFloat(this.registrationData.weeklyTarget);

    // ✅ BENAR: Mifflin-St Jeor Equation (bukan Harris-Benedict)
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
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

    // ✅ TAMBAHAN: Validasi untuk kasus ekstrem
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

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(safeTargetCalories),
      weeklyDeficit: Math.round(weeklyDeficit),
      dailyDeficit: Math.round(dailyDeficit),
      isMinimumCalories: targetCalories < minCalories,
      warnings: warnings, // ✅ TAMBAHAN: Peringatan keamanan
      equation: 'Mifflin-St Jeor', // ✅ TAMBAHAN: Info rumus yang digunakan
      disclaimer: 'Hasil ini adalah estimasi. Konsultasi dengan ahli gizi untuk hasil yang lebih akurat.' // ✅ TAMBAHAN
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
      activityLevel: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
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
}