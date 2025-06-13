import WorkoutSessions from '../models/WorkoutSessionModel.js';
import Users from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

// Helper function untuk mendapatkan user dari token
const getUserFromToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('Token tidak ditemukan');
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
  const user = await Users.findOne({
    where: { id: decoded.userId }
  });
  
  if (!user) {
    throw new Error('User tidak ditemukan');
  }
  
  return user;
};

// Simpan workout session
export const saveWorkoutSession = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    
    const {
      exerciseName,
      predictedExercise,
      duration,
      caloriesBurned,
      bmr,
      exerciseImage,
      workoutDate,
      status,
      notes
    } = req.body;

    // Validasi input
    if (!exerciseName || !duration || caloriesBurned === undefined) {
      return res.status(400).json({
        error: 'exerciseName, duration, dan caloriesBurned wajib diisi',
        status: 'error'
      });
    }

    if (duration <= 0) {
      return res.status(400).json({
        error: 'Duration harus lebih dari 0',
        status: 'error'
      });
    }

    // Buat workout session baru
    const workoutSession = await WorkoutSessions.create({
      userId: user.id,
      exerciseName,
      predictedExercise: predictedExercise || exerciseName,
      duration,
      caloriesBurned,
      bmr,
      exerciseImage,
      workoutDate: workoutDate || new Date().toISOString().split('T')[0],
      workoutTime: new Date().toTimeString().split(' ')[0],
      status: status || 'saved',
      notes,
      // Metadata user saat workout
      userWeight: user.currentWeight,
      userHeight: user.height,
      userAge: user.age,
      userGender: user.gender
    });

    res.status(201).json({
      data: workoutSession,
      status: 'success',
      message: 'Workout session berhasil disimpan'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token tidak valid',
        status: 'error'
      });
    }
    
    console.error('Save workout session error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      status: 'error'
    });
  }
};

// Ambil workout sessions user
export const getWorkoutSessions = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    
    const { 
      date, 
      startDate, 
      endDate, 
      exercise, 
      status,
      page = 1, 
      limit = 50 
    } = req.query;

    // Build where clause
    const whereClause = { userId: user.id };

    if (date) {
      whereClause.workoutDate = date;
    }

    if (startDate && endDate) {
      whereClause.workoutDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (exercise) {
      whereClause[Op.or] = [
        { exerciseName: { [Op.iLike]: `%${exercise}%` } },
        { predictedExercise: { [Op.iLike]: `%${exercise}%` } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    // Pagination
    const offset = (page - 1) * limit;

    const { count, rows } = await WorkoutSessions.findAndCountAll({
      where: whereClause,
      order: [['workoutDate', 'DESC'], ['workoutTime', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      include: [{
        model: Users,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    // Calculate statistics
    const totalCalories = rows.reduce((sum, session) => sum + session.caloriesBurned, 0);
    const totalDuration = rows.reduce((sum, session) => sum + session.duration, 0);
    const uniqueExercises = [...new Set(rows.map(session => session.predictedExercise))];

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        hasNext: offset + rows.length < count,
        hasPrev: page > 1
      },
      statistics: {
        totalSessions: count,
        totalCalories: parseFloat(totalCalories.toFixed(2)),
        totalDuration: totalDuration,
        totalDurationMinutes: Math.round(totalDuration / 60),
        uniqueExercises: uniqueExercises.length,
        exerciseTypes: uniqueExercises
      },
      status: 'success'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token tidak valid',
        status: 'error'
      });
    }
    
    console.error('Get workout sessions error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      status: 'error'
    });
  }
};

// Ambil workout session by ID
export const getWorkoutSessionById = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    const workoutSession = await WorkoutSessions.findOne({
      where: { 
        id: id,
        userId: user.id 
      },
      include: [{
        model: Users,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    if (!workoutSession) {
      return res.status(404).json({
        error: 'Workout session tidak ditemukan',
        status: 'error'
      });
    }

    res.json({
      data: workoutSession,
      status: 'success'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token tidak valid',
        status: 'error'
      });
    }
    
    console.error('Get workout session by ID error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      status: 'error'
    });
  }
};

// Update workout session
export const updateWorkoutSession = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;
    
    const {
      exerciseName,
      duration,
      caloriesBurned,
      status,
      notes
    } = req.body;

    const workoutSession = await WorkoutSessions.findOne({
      where: { 
        id: id,
        userId: user.id 
      }
    });

    if (!workoutSession) {
      return res.status(404).json({
        error: 'Workout session tidak ditemukan',
        status: 'error'
      });
    }

    // Update fields
    const updateData = {};
    if (exerciseName) updateData.exerciseName = exerciseName;
    if (duration) updateData.duration = duration;
    if (caloriesBurned !== undefined) updateData.caloriesBurned = caloriesBurned;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await workoutSession.update(updateData);

    res.json({
      data: workoutSession,
      status: 'success',
      message: 'Workout session berhasil diupdate'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token tidak valid',
        status: 'error'
      });
    }
    
    console.error('Update workout session error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      status: 'error'
    });
  }
};

// Hapus workout session
export const deleteWorkoutSession = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    const workoutSession = await WorkoutSessions.findOne({
      where: { 
        id: id,
        userId: user.id 
      }
    });

    if (!workoutSession) {
      return res.status(404).json({
        error: 'Workout session tidak ditemukan',
        status: 'error'
      });
    }

    await workoutSession.destroy();

    res.json({
      status: 'success',
      message: 'Workout session berhasil dihapus'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token tidak valid',
        status: 'error'
      });
    }
    
    console.error('Delete workout session error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      status: 'error'
    });
  }
};

// Get workout statistics per tanggal
export const getWorkoutStatistics = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFilter = { userId: user.id };
    
    if (startDate && endDate) {
      dateFilter.workoutDate = {
        [Op.between]: [startDate, endDate]
      };
    } else {
      // Default: last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.workoutDate = {
        [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0]
      };
    }

    const sessions = await WorkoutSessions.findAll({
      where: dateFilter,
      order: [['workoutDate', 'ASC']]
    });

    // Group by date
    const groupedData = sessions.reduce((acc, session) => {
      const date = session.workoutDate;
      if (!acc[date]) {
        acc[date] = {
          date,
          totalCalories: 0,
          totalDuration: 0,
          sessionCount: 0,
          exercises: []
        };
      }
      
      acc[date].totalCalories += session.caloriesBurned;
      acc[date].totalDuration += session.duration;
      acc[date].sessionCount += 1;
      acc[date].exercises.push({
        name: session.predictedExercise,
        calories: session.caloriesBurned,
        duration: session.duration
      });
      
      return acc;
    }, {});

    const result = Object.values(groupedData).map(day => ({
      ...day,
      totalCalories: parseFloat(day.totalCalories.toFixed(2)),
      totalDurationMinutes: Math.round(day.totalDuration / 60)
    }));

    res.json({
      data: result,
      summary: {
        totalDays: result.length,
        totalCalories: result.reduce((sum, day) => sum + day.totalCalories, 0),
        totalSessions: result.reduce((sum, day) => sum + day.sessionCount, 0),
        averageCaloriesPerDay: result.length > 0 ? 
          (result.reduce((sum, day) => sum + day.totalCalories, 0) / result.length).toFixed(2) : 0
      },
      status: 'success'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token tidak valid',
        status: 'error'
      });
    }
    
    console.error('Get workout statistics error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      status: 'error'
    });
  }
};