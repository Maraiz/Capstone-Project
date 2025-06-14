// models/userModel.js
import { db } from '../config/Database.js';

// Mapping antara JavaScript (camelCase) dan Database (snake_case)
const fieldMapping = {
    currentWeight: 'current_weight',
    targetWeight: 'target_weight',
    weeklyTarget: 'weekly_target',
    targetDeadline: 'target_deadline',
    activityLevel: 'activity_level',
    targetCalories: 'target_calories',
    refreshToken: 'refresh_token',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
};

// Reverse mapping untuk response
const reverseFieldMapping = Object.fromEntries(
    Object.entries(fieldMapping).map(([key, value]) => [value, key])
);

// Helper function untuk convert field names
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

// Validation functions (client-side)
const validateUser = (userData) => {
    const errors = [];
    
    if (userData.name) {
        if (userData.name.length < 2 || userData.name.length > 50) {
            errors.push('Name must be between 2 and 50 characters');
        }
    }
    
    if (userData.gender && !['male', 'female'].includes(userData.gender)) {
        errors.push('Gender must be either male or female');
    }
    
    if (userData.age !== undefined) {
        if (userData.age < 13 || userData.age > 100) {
            errors.push('Age must be between 13 and 100');
        }
    }
    
    if (userData.height !== undefined) {
        if (userData.height < 100 || userData.height > 250) {
            errors.push('Height must be between 100 and 250 cm');
        }
    }
    
    if (userData.currentWeight !== undefined) {
        if (userData.currentWeight < 30 || userData.currentWeight > 300) {
            errors.push('Current weight must be between 30 and 300 kg');
        }
    }
    
    if (userData.targetWeight !== undefined) {
        if (userData.targetWeight < 30 || userData.targetWeight > 200) {
            errors.push('Target weight must be between 30 and 200 kg');
        }
    }
    
    if (userData.username) {
        if (userData.username.length < 3 || userData.username.length > 20) {
            errors.push('Username must be between 3 and 20 characters');
        }
    }
    
    if (userData.email) {
        const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('Invalid email format');
        }
    }
    
    if (userData.password) {
        if (userData.password.length < 6 || userData.password.length > 255) {
            errors.push('Password must be between 6 and 255 characters');
        }
    }
    
    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }
};

export const Users = {
    // CREATE - Insert new user
    create: async (userData) => {
        // Validate data
        validateUser(userData);
        
        // Convert field names to database format
        const dbData = convertToDbFields(userData);
        
        const { data, error } = await db
            .from('users')
            .insert(dbData)
            .select()
            .single();
        
        if (error) {
            // Handle unique constraint errors
            if (error.code === '23505') {
                if (error.message.includes('email')) {
                    throw new Error('Email already exists');
                }
                if (error.message.includes('username')) {
                    throw new Error('Username already exists');
                }
            }
            throw error;
        }
        
        return convertFromDbFields(data);
    },

    // READ - Find all users
    findAll: async (options = {}) => {
        let query = db.from('users').select('*');
        
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
        
        const { data, error } = await query;
        if (error) throw error;
        
        return data ? data.map(convertFromDbFields) : [];
    },

    // READ - Find one user
    findOne: async (options = {}) => {
        let query = db.from('users').select('*');
        
        if (options.where) {
            const dbWhere = convertToDbFields(options.where);
            Object.entries(dbWhere).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        
        return data ? convertFromDbFields(data) : null;
    },

    // READ - Find by primary key
    findByPk: async (id) => {
        const { data, error } = await db
            .from('users')
            .select('*')
            .eq('id', id)
            .maybeSingle();
            
        if (error) throw error;
        return data ? convertFromDbFields(data) : null;
    },

    // UPDATE - Update user
    update: async (updateData, options) => {
        // Validate data
        validateUser(updateData);
        
        // Convert field names
        const dbUpdateData = convertToDbFields(updateData);
        let query = db.from('users').update(dbUpdateData);
        
        if (options.where) {
            const dbWhere = convertToDbFields(options.where);
            Object.entries(dbWhere).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { data, error } = await query.select();
        if (error) {
            // Handle unique constraint errors
            if (error.code === '23505') {
                if (error.message.includes('email')) {
                    throw new Error('Email already exists');
                }
                if (error.message.includes('username')) {
                    throw new Error('Username already exists');
                }
            }
            throw error;
        }
        
        return data ? data.map(convertFromDbFields) : [];
    },

    // DELETE - Delete user
    destroy: async (options) => {
        let query = db.from('users').delete();
        
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
    findByEmail: async (email) => {
        const { data, error } = await db
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
            
        if (error) throw error;
        return data ? convertFromDbFields(data) : null;
    },

    findByUsername: async (username) => {
        const { data, error } = await db
            .from('users')
            .select('*')
            .eq('username', username)
            .maybeSingle();
            
        if (error) throw error;
        return data ? convertFromDbFields(data) : null;
    },

    // Count users
    count: async (options = {}) => {
        let query = db.from('users').select('*', { count: 'exact', head: true });
        
        if (options.where) {
            const dbWhere = convertToDbFields(options.where);
            Object.entries(dbWhere).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { count, error } = await query;
        if (error) throw error;
        return count;
    },

    // Update refresh token
    updateRefreshToken: async (userId, refreshToken) => {
        const { data, error } = await db
            .from('users')
            .update({ refresh_token: refreshToken })
            .eq('id', userId)
            .select()
            .single();
            
        if (error) throw error;
        return convertFromDbFields(data);
    },

    // Association methods - Get user's workout sessions
    getWorkoutSessions: async (userId, options = {}) => {
        let query = db.from('workout_sessions')
            .select('*')
            .eq('user_id', userId);
        
        // Handle limit
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        // Handle order (default: newest first)
        const orderBy = options.order || [['created_at', 'desc']];
        if (orderBy.length > 0) {
            const [column, direction] = orderBy[0];
            query = query.order(column, { ascending: direction === 'asc' });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        return data || [];
    }
};

// Export default untuk kompatibilitas dengan route files
export default Users;