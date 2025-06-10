import Users from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// MET untuk berbagai gerakan
const metDict = {
  'squat': 5.0,
  'deadlift': 6.0,
  'bench_press': 6.0,
  'push_up': 8.0,
  'pull_up': 8.0,
  'plank': 3.0,
  'shoulder_press': 5.0,
  'triceps': 4.5,
  'leg_extension': 5.0
};

// Fungsi menghitung BMR
const hitungBMR = (berat, tinggi, umur, jenisKelamin) => {
  if (jenisKelamin.toLowerCase() === 'male' || jenisKelamin.toLowerCase() === 'laki-laki') {
    return 10 * berat + 6.25 * tinggi - 5 * umur + 5;
  } else {
    return 10 * berat + 6.25 * tinggi - 5 * umur - 161;
  }
};

// Fungsi menghitung kalori terbakar
const kaloriTerbakar = (met, berat, durasiMenit) => {
  return 0.0175 * met * berat * durasiMenit;
};

// API utama untuk menghitung kalori dari prediksi gambar
export const calculateWorkoutCalories = async (req, res) => {
  try {
    const { gerakan, durasi } = req.body;
    
    // Ambil token dari header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token tidak ditemukan',
        status: 'error'
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Ambil data user dari database
    const user = await Users.findOne({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'User tidak ditemukan',
        status: 'error'
      });
    }

    // Validasi input
    if (!gerakan || !durasi) {
      return res.status(400).json({
        error: 'Gerakan dan durasi harus diisi',
        status: 'error'
      });
    }

    if (durasi <= 0) {
      return res.status(400).json({
        error: 'Durasi harus lebih dari 0',
        status: 'error'
      });
    }

    // Cek apakah gerakan tersedia
    const gerakanLower = gerakan.toLowerCase();
    if (!metDict[gerakanLower]) {
      return res.status(400).json({
        error: `Gerakan '${gerakan}' tidak tersedia`,
        availableExercises: Object.keys(metDict),
        status: 'error'
      });
    }

    // Hitung BMR dan kalori terbakar
    const bmr = hitungBMR(user.currentWeight, user.height, user.age, user.gender);
    const met = metDict[gerakanLower];
    const kalori = kaloriTerbakar(met, user.currentWeight, durasi);

    // Response sesuai format Python
    res.json({
      hasil: {
        nama: user.name,
        jenisKelamin: user.gender,
        umur: user.age,
        tinggi: user.height,
        berat: user.currentWeight,
        gerakan: gerakanLower,
        durasi: durasi,
        bmr: parseFloat(bmr.toFixed(2)),
        kaloriTerbakar: parseFloat(kalori.toFixed(2))
      },
      status: 'success',
      message: `${user.name} melakukan ${gerakanLower} selama ${durasi} menit dan membakar ${kalori.toFixed(2)} kalori`
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token tidak valid',
        status: 'error'
      });
    }
    
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      status: 'error'
    });
  }
};

// API untuk mendapatkan daftar gerakan yang tersedia
export const getAvailableExercises = (req, res) => {
  try {
    const exercises = Object.keys(metDict).map(exercise => ({
      nama: exercise,
      met: metDict[exercise]
    }));

    res.json({
      exercises,
      total: exercises.length,
      status: 'success'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan: ' + error.message,
      status: 'error'
    });
  }
};