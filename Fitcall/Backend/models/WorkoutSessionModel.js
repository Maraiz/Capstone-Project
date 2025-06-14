// models/workoutSessionModel.js
import { db } from '../config/Database.js';

// Field mapping between JavaScript (camelCase) and Database (snake_case)
const fieldMapping = {
    userId: 'user_id',
    exerciseName: 'exercise_name',
    predictedExercise: 'predicted_exercise',
    caloriesBurned: 'calories_burned',
    exerciseImage: 'exercise_image',
    workoutDate: 'workout_date',
    workoutTime: 'workout_time',
    userWeight: 'user_weight',
    userHeight: 'user_height',
    userAge: 'user_age',
    userGender: 'user_gender',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
};

// Reverse mapping
const reverseFieldMapping = Object.fromEntries(
    Object.entries(fieldMapping).map(([key, value]) => [value, key])
);

// Helper functions for field conversion
const convertToDbFields = (obj) => {
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
        const dbField = fieldMapping[key] || key;
        converted[dbField] = value;
    }
    return converted;
};

const convertFromDbFields = (obj) => {
    if (!obj) return obj;
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
        const jsField = reverseFieldMapping[key] || key;
        converted[jsField] = value;
    }
    return converted;
};

// Validation function
const validateWorkoutSession = (sessionData) => {
    const errors = [];
    
    if (!sessionData.userId) {
        errors.push('User ID is required');
    }
    
    if (!sessionData.exerciseName || sessionData.exerciseName.length === 0) {
        errors.push('Exercise name is required');
    }
    
    if (sessionData.duration !== undefined) {
        if (sessionData.duration <= 0) {
            errors.push('Duration must be greater than 0');
        }
    }
    
    if (sessionData.caloriesBurned !== undefined) {
        if (sessionData.caloriesBurned < 0) {
            errors.push('Calories burned cannot be negative');
        }
    }
    
    if (sessionData.status && !['completed', 'saved', 'analyzing'].includes(sessionData.status)) {
        errors.push('Status must be one of: completed, saved, analyzing');
    }
    
    if (sessionData.userGender && !['male', 'female'].includes(sessionData.userGender)) {
        errors.push('User gender must be either male or female');
    }
    
    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }
};

export const WorkoutSessions = {
    // CREATE - Insert new workout session
    create: async (sessionData) => {
        // Validate data
        validateWorkoutSession(sessionData);
        
        // Set default values
        const dataWithDefaults = {
            workoutDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            workoutTime: new Date().toTimeString().split(' ')[0], // HH:MM:SS
            status: 'saved',
            ...sessionData
        };
        
        // Convert field names
        const dbData = convertToDbFields(dataWithDefaults);
        
        const { data, error } = await db
            .from('workout_sessions')
            .insert(dbData)
            .select()
            .single();
        
        if (error) {
            // Handle foreign key constraint errors
            if (error.code === '23503') {
                throw new Error('User not found');
            }
            throw error;
        }
        
        return convertFromDbFields(data);
    },

    // READ - Find all workout sessions
    findAll: async (options = {}) => {
        let query = db.from('workout_sessions').select('*');
        
        // Handle where conditions
        if (options.where) {
            const dbWhere = convertToDbFields(options.where);
            Object.entries(dbWhere).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        // Handle limit
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        // Handle order
        if (options.order) {
            const [column, direction] = options.order[0];
            const dbColumn = fieldMapping[column] || column;
            query = query.order(dbColumn, { ascending: direction === 'ASC' });
        }
        
        // Handle include (join with users)
        if (options.include && options.include.some(inc => inc.model === 'Users' || inc.as === 'user')) {
            query = db.from('workout_sessions')
                .select(`
                    workout_sessions.*,
                    users.name as user_name,
                    users.email as user_email
                `)
                .leftJoin('users', 'workout_sessions.user_id', 'users.id');
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        return data ? data.map(convertFromDbFields) : [];
    },

    // READ - Find one workout session
    findOne: async (options = {}) => {
        let query = db.from('workout_sessions').select('*');
        
        if (options.where) {
            const dbWhere = convertToDbFields(options.where);
            Object.entries(dbWhere).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        // Handle include (join with users)
        if (options.include && options.include.some(inc => inc.model === 'Users' || inc.as === 'user')) {
            query = db.from('workout_sessions')
                .select(`
                    workout_sessions.*,
                    users.name as user_name,
                    users.email as user_email,
                    users.current_weight as user_current_weight,
                    users.height as user_height_profile
                `)
                .leftJoin('users', 'workout_sessions.user_id', 'users.id');
        }
        
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        
        return data ? convertFromDbFields(data) : null;
    },

    // READ - Find by primary key
    findByPk: async (id, options = {}) => {
        let query = db.from('workout_sessions').select('*').eq('id', id);
        
        // Handle include
        if (options.include && options.include.some(inc => inc.model === 'Users' || inc.as === 'user')) {
            query = db.from('workout_sessions')
                .select(`
                    workout_sessions.*,
                    users.name as user_name,
                    users.email as user_email
                `)
                .leftJoin('users', 'workout_sessions.user_id', 'users.id')
                .eq('workout_sessions.id', id);
        }
        
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        
        return data ? convertFromDbFields(data) : null;
    },

    // UPDATE - Update workout session
    update: async (updateData, options) => {
        // Validate data
        validateWorkoutSession(updateData);
        
        // Convert field names
        const dbUpdateData = convertToDbFields(updateData);
        let query = db.from('workout_sessions').update(dbUpdateData);
        
        if (options.where) {
            const dbWhere = convertToDbFields(options.where);
            Object.entries(dbWhere).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { data, error } = await query.select();
        if (error) throw error;
        
        return data ? data.map(convertFromDbFields) : [];
    },

    // DELETE - Delete workout session
    destroy: async (options) => {
        let query = db.from('workout_sessions').delete();
        
        if (options.where) {
            const dbWhere = convertToDbFields(options.where);
            Object.entries(dbWhere).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { data, error } = await query.select();
        if (error) throw error;
        
        return data ? data.length : 0;
    },

    // Custom methods
    findByUserId: async (userId, options = {}) => {
        let query = db.from('workout_sessions')
            .select('*')
            .eq('user_id', userId);
        
        // Handle order (default: newest first)
        const orderBy = options.orderBy || [['createdAt', 'DESC']];
        const [column, direction] = orderBy[0];
        const dbColumn = fieldMapping[column] || column;
        query = query.order(dbColumn, { ascending: direction === 'ASC' });
        
        // Handle limit
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        return data ? data.map(convertFromDbFields) : [];
    },

    // Get workout sessions by date range
    findByDateRange: async (userId, startDate, endDate) => {
        const { data, error } = await db
            .from('workout_sessions')
            .select('*')
            .eq('user_id', userId)
            .gte('workout_date', startDate)
            .lte('workout_date', endDate)
            .order('workout_date', { ascending: false });
        
        if (error) throw error;
        return data ? data.map(convertFromDbFields) : [];
    },

    // Get today's workouts
    getTodayWorkouts: async (userId) => {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await db
            .from('workout_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('workout_date', today)
            .order('workout_time', { ascending: false });
        
        if (error) throw error;
        return data ? data.map(convertFromDbFields) : [];
    },

    // Get workout statistics
    getWorkoutStats: async (userId, options = {}) => {
        const { timeframe = '30' } = options; // days
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(timeframe));
        
        const { data, error } = await db
            .from('workout_sessions')
            .select('calories_burned, duration, workout_date')
            .eq('user_id', userId)
            .gte('workout_date', dateLimit.toISOString().split('T')[0])
            .eq('status', 'completed');
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            return {
                totalWorkouts: 0,
                totalCalories: 0,
                totalDuration: 0,
                averageCaloriesPerWorkout: 0,
                averageDurationPerWorkout: 0
            };
        }
        
        const totalWorkouts = data.length;
        const totalCalories = data.reduce((sum, workout) => sum + parseFloat(workout.calories_burned || 0), 0);
        const totalDuration = data.reduce((sum, workout) => sum + parseInt(workout.duration || 0), 0);
        
        return {
            totalWorkouts,
            totalCalories: Math.round(totalCalories * 100) / 100,
            totalDuration,
            averageCaloriesPerWorkout: Math.round((totalCalories / totalWorkouts) * 100) / 100,
            averageDurationPerWorkout: Math.round(totalDuration / totalWorkouts)
        };
    },

    // Count workout sessions
    count: async (options = {}) => {
        let query = db.from('workout_sessions').select('*', { count: 'exact', head: true });
        
        if (options.where) {
            const dbWhere = convertToDbFields(options.where);
            Object.entries(dbWhere).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { count, error } = await query;
        if (error) throw error;
        return count;
    }
};

// Export default untuk kompatibilitas
export default WorkoutSessions;