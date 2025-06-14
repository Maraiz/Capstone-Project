// WorkoutSessions.js - SUPABASE VERSION (Final)
import { supabase } from '../config/Database.js';
import jwt from 'jsonwebtoken';

// Helper function untuk mendapatkan user dari token
const getUserFromToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('Token tidak ditemukan');
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
  console.log('🟡 Token verified for user:', decoded.userId);
  
  // Query user dengan Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', decoded.userId)
    .single();
  
  if (error || !user) {
    console.error('🔴 User query error:', error);
    throw new Error('User tidak ditemukan');
  }
  
  console.log('🟢 User found:', user.name);
  return user;
};

// Simpan workout session - SUPABASE VERSION
export const saveWorkoutSession = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    console.log('🟡 Saving workout session for user:', user.id);
    
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

    // Data untuk insert - GUNAKAN SNAKE_CASE untuk Supabase
    const insertData = {
      user_id: user.id,
      exercise_name: exerciseName,
      predicted_exercise: predictedExercise || exerciseName,
      duration: duration,
      calories_burned: caloriesBurned,
      bmr: bmr,
      exercise_image: exerciseImage,
      workout_date: workoutDate || new Date().toISOString().split('T')[0],
      workout_time: new Date().toTimeString().split(' ')[0],
      status: status || 'saved',
      notes: notes,
      // Metadata user saat workout
      user_weight: user.current_weight || user.currentWeight,
      user_height: user.height,
      user_age: user.age,
      user_gender: user.gender
    };

    console.log('🟡 Insert data:', insertData);

    // Insert dengan Supabase
    const { data: workoutSession, error } = await supabase
      .from('workout_sessions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('🔴 Supabase insert error:', error);
      return res.status(500).json({
        error: 'Gagal menyimpan workout session: ' + error.message,
        status: 'error'
      });
    }

    console.log('🟢 Insert successful:', workoutSession.id);

    // Convert response ke camelCase untuk frontend
    const responseData = {
      id: workoutSession.id,
      userId: workoutSession.user_id,
      exerciseName: workoutSession.exercise_name,
      predictedExercise: workoutSession.predicted_exercise,
      duration: workoutSession.duration,
      caloriesBurned: workoutSession.calories_burned,
      bmr: workoutSession.bmr,
      exerciseImage: workoutSession.exercise_image,
      workoutDate: workoutSession.workout_date,
      workoutTime: workoutSession.workout_time,
      status: workoutSession.status,
      notes: workoutSession.notes,
      userWeight: workoutSession.user_weight,
      userHeight: workoutSession.user_height,
      userAge: workoutSession.user_age,
      userGender: workoutSession.user_gender,
      createdAt: workoutSession.created_at,
      updatedAt: workoutSession.updated_at
    };

    res.status(201).json({
      data: responseData,
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
    
    console.error('🔴 Save workout session error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      status: 'error'
    });
  }
};

// Ambil workout sessions user - SUPABASE VERSION
export const getWorkoutSessions = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    console.log('🟡 Getting workout sessions for user:', user.id);
    
    const { 
      date, 
      startDate, 
      endDate, 
      exercise, 
      status,
      page = 1, 
      limit = 50 
    } = req.query;

    console.log('🟡 Query params:', { date, startDate, endDate, exercise, status, page, limit });

    // GUNAKAN SNAKE_CASE untuk query
    let query = supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id);  // UUID user

    // Filters dengan snake_case
    if (date) {
      query = query.eq('workout_date', date);
      console.log('🟡 Added date filter:', date);
    }

    if (startDate && endDate) {
      query = query
        .gte('workout_date', startDate)
        .lte('workout_date', endDate);
      console.log('🟡 Added date range filter:', startDate, 'to', endDate);
    }

    if (exercise) {
      query = query.or(`exercise_name.ilike.%${exercise}%,predicted_exercise.ilike.%${exercise}%`);
      console.log('🟡 Added exercise filter:', exercise);
    }

    if (status) {
      query = query.eq('status', status);
      console.log('🟡 Added status filter:', status);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('workout_date', { ascending: false })
      .order('workout_time', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    console.log('🟡 Executing main query with pagination...');

    // Execute query
    const { data: rows, error } = await query;

    if (error) {
      console.error('🔴 Supabase query error:', error);
      return res.status(500).json({
        error: 'Gagal mengambil data: ' + error.message,
        status: 'error'
      });
    }

    console.log('🟢 Query successful, rows found:', rows ? rows.length : 0);

    // Get total count dengan query terpisah
    console.log('🟡 Getting total count...');
    let countQuery = supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (date) countQuery = countQuery.eq('workout_date', date);
    if (startDate && endDate) {
      countQuery = countQuery.gte('workout_date', startDate).lte('workout_date', endDate);
    }
    if (exercise) {
      countQuery = countQuery.or(`exercise_name.ilike.%${exercise}%,predicted_exercise.ilike.%${exercise}%`);
    }
    if (status) countQuery = countQuery.eq('status', status);

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('🔴 Count query error:', countError);
    } else {
      console.log('🟢 Total count:', totalCount);
    }

    // Convert snake_case response to camelCase untuk frontend
    const convertedRows = rows ? rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      exerciseName: row.exercise_name,
      predictedExercise: row.predicted_exercise,
      duration: row.duration,
      caloriesBurned: row.calories_burned,
      bmr: row.bmr,
      exerciseImage: row.exercise_image,
      workoutDate: row.workout_date,
      workoutTime: row.workout_time,
      status: row.status,
      notes: row.notes,
      userWeight: row.user_weight,
      userHeight: row.user_height,
      userAge: row.user_age,
      userGender: row.user_gender,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) : [];

    // Calculate statistics
    const totalCalories = convertedRows.reduce((sum, session) => sum + (session.caloriesBurned || 0), 0);
    const totalDuration = convertedRows.reduce((sum, session) => sum + (session.duration || 0), 0);
    const uniqueExercises = [...new Set(convertedRows.map(session => session.predictedExercise || session.exerciseName))];

    const response = {
      data: convertedRows,
      pagination: {
        total: totalCount || 0,
        page: parseInt(page),
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNext: offset + (convertedRows.length) < (totalCount || 0),
        hasPrev: page > 1
      },
      statistics: {
        totalSessions: totalCount || 0,
        totalCalories: parseFloat(totalCalories.toFixed(2)),
        totalDuration: totalDuration,
        totalDurationMinutes: Math.round(totalDuration / 60),
        uniqueExercises: uniqueExercises.length,
        exerciseTypes: uniqueExercises
      },
      status: 'success'
    };

    console.log('🟢 Response prepared:', {
      dataCount: response.data.length,
      totalCount: response.pagination.total,
      totalCalories: response.statistics.totalCalories
    });

    res.json(response);

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token tidak valid',
        status: 'error'
      });
    }
    
    console.error('🔴 Get workout sessions error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      status: 'error'
    });
  }
};

// Ambil workout session by ID - SUPABASE VERSION
export const getWorkoutSessionById = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    const { data: workoutSession, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !workoutSession) {
      return res.status(404).json({
        error: 'Workout session tidak ditemukan',
        status: 'error'
      });
    }

    // Convert to camelCase
    const responseData = {
      id: workoutSession.id,
      userId: workoutSession.user_id,
      exerciseName: workoutSession.exercise_name,
      predictedExercise: workoutSession.predicted_exercise,
      duration: workoutSession.duration,
      caloriesBurned: workoutSession.calories_burned,
      bmr: workoutSession.bmr,
      exerciseImage: workoutSession.exercise_image,
      workoutDate: workoutSession.workout_date,
      workoutTime: workoutSession.workout_time,
      status: workoutSession.status,
      notes: workoutSession.notes,
      userWeight: workoutSession.user_weight,
      userHeight: workoutSession.user_height,
      userAge: workoutSession.user_age,
      userGender: workoutSession.user_gender,
      createdAt: workoutSession.created_at,
      updatedAt: workoutSession.updated_at
    };

    res.json({
      data: responseData,
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

// Update workout session - SUPABASE VERSION
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

    // Build update data dengan snake_case
    const updateData = {};
    if (exerciseName) updateData.exercise_name = exerciseName;
    if (duration) updateData.duration = duration;
    if (caloriesBurned !== undefined) updateData.calories_burned = caloriesBurned;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data: workoutSession, error } = await supabase
      .from('workout_sessions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Workout session tidak ditemukan',
          status: 'error'
        });
      }
      
      return res.status(500).json({
        error: 'Gagal update: ' + error.message,
        status: 'error'
      });
    }

    // Convert to camelCase
    const responseData = {
      id: workoutSession.id,
      userId: workoutSession.user_id,
      exerciseName: workoutSession.exercise_name,
      predictedExercise: workoutSession.predicted_exercise,
      duration: workoutSession.duration,
      caloriesBurned: workoutSession.calories_burned,
      bmr: workoutSession.bmr,
      exerciseImage: workoutSession.exercise_image,
      workoutDate: workoutSession.workout_date,
      workoutTime: workoutSession.workout_time,
      status: workoutSession.status,
      notes: workoutSession.notes,
      userWeight: workoutSession.user_weight,
      userHeight: workoutSession.user_height,
      userAge: workoutSession.user_age,
      userGender: workoutSession.user_gender,
      createdAt: workoutSession.created_at,
      updatedAt: workoutSession.updated_at
    };

    res.json({
      data: responseData,
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

// Hapus workout session - SUPABASE VERSION
export const deleteWorkoutSession = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return res.status(500).json({
        error: 'Gagal hapus: ' + error.message,
        status: 'error'
      });
    }

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

// Get workout statistics - SUPABASE VERSION
export const getWorkoutStatistics = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id);
    
    if (startDate && endDate) {
      query = query
        .gte('workout_date', startDate)
        .lte('workout_date', endDate);
    } else {
      // Default: last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte('workout_date', thirtyDaysAgo.toISOString().split('T')[0]);
    }

    query = query.order('workout_date', { ascending: true });

    const { data: sessions, error } = await query;

    if (error) {
      return res.status(500).json({
        error: 'Gagal ambil statistik: ' + error.message,
        status: 'error'
      });
    }

    // Group by date
    const groupedData = sessions.reduce((acc, session) => {
      const date = session.workout_date;
      if (!acc[date]) {
        acc[date] = {
          date,
          totalCalories: 0,
          totalDuration: 0,
          sessionCount: 0,
          exercises: []
        };
      }
      
      acc[date].totalCalories += session.calories_burned;
      acc[date].totalDuration += session.duration;
      acc[date].sessionCount += 1;
      acc[date].exercises.push({
        name: session.predicted_exercise,
        calories: session.calories_burned,
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