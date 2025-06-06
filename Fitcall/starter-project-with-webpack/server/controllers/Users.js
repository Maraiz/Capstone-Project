import Users from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

export const Register = async (req, res) => {
    const { 
        // Step 1 - Basic Info
        name,
        
        // Step 2 - Personal Info
        country,
        gender,
        age,
        
        // Step 3 - Physical Info  
        height,
        currentWeight,
        targetWeight,
        
        // Step 4 - Goals
        weeklyTarget,
        targetDeadline,
        
        // Step 5 - Activity
        activityLevel,
        
        // Step 6 - Calculated (optional, bisa di-calculate di backend)
        targetCalories,
        
        // Step 7 - Account
        username,
        email,
        password,
        confirmPassword
    } = req.body;
    
    // Validation
    if (!name || !email || !password || !username) {
        return res.status(400).json({ 
            msg: "Name, username, email, dan password wajib diisi" 
        });
    }
    
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            msg: "Password dan Confirm Password tidak cocok" 
        });
    }
    
    try {
        // Check existing email & username
        const existingUser = await Users.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { username: username }
                ]
            }
        });
        
        if (existingUser) {
            return res.status(400).json({
                msg: existingUser.email === email ? 
                     "Email sudah terdaftar" : 
                     "Username sudah digunakan"
            });
        }
        
        // Calculate calories if not provided
        let calculatedCalories = targetCalories;
        if (!calculatedCalories && height && currentWeight && age && gender && activityLevel && weeklyTarget) {
            calculatedCalories = calculateCalories({
                height, currentWeight, age, gender, activityLevel, weeklyTarget
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        
        // Create user dengan semua field
        const newUser = await Users.create({
            // Step 1
            name,
            
            // Step 2
            country,
            gender,
            age,
            
            // Step 3
            height,
            currentWeight,
            targetWeight,
            
            // Step 4
            weeklyTarget,
            targetDeadline,
            
            // Step 5
            activityLevel,
            
            // Step 6
            targetCalories: calculatedCalories,
            
            // Step 7
            username,
            email,
            password: hashPassword
        });
        
        // Return success (exclude password)
        const { password: _, ...userWithoutPassword } = newUser.toJSON();
        
        res.status(201).json({
            msg: "Register Berhasil",
            data: userWithoutPassword
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                msg: "Data tidak valid",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        
        res.status(500).json({
            msg: "Terjadi kesalahan server"
        });
    }
}

// Helper function untuk calculate calories
function calculateCalories({ height, currentWeight, age, gender, activityLevel, weeklyTarget }) {
    const weight = parseFloat(currentWeight);
    const heightCm = parseFloat(height);
    const ageNum = parseInt(age);
    const activity = parseFloat(activityLevel);
    const target = parseFloat(weeklyTarget);

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * heightCm) - (5 * ageNum) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * heightCm) - (5 * ageNum) - 161;
    }

    const tdee = bmr * activity;
    const weeklyDeficit = target * 7700;
    const dailyDeficit = weeklyDeficit / 7;
    const targetCalories = tdee - dailyDeficit;
    const minCalories = gender === 'male' ? 1500 : 1200;
    
    return Math.max(Math.round(targetCalories), minCalories);
}