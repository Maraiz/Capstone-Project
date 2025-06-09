import Users from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';


export const getUsers = async (req, res) => {
    try {
        // ✅ Ambil userId dari token
        const userId = req.userId;
        
        console.log('Current user ID from token:', userId); // Debug log
        
        if (!userId) {
            return res.status(400).json({ msg: "User ID tidak ditemukan dalam token" });
        }
        
        // ✅ Return data user yang sedang login saja
        const user = await Users.findOne({
            where: { id: userId },
            attributes: [
                'id', 'name', 'email', 'username', 
                'targetCalories', 'currentWeight', 'targetWeight',
                'weeklyTarget', 'height', 'age', 'gender', 
                'activityLevel', 'country'
            ]
        });
        
        if (!user) {
            console.log('User not found for ID:', userId);
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }
        
        console.log('User found:', user.name);
        res.json(user); // Return single object
        
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ msg: "Server error" });
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

export const Login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ msg: "Email dan password harus diisi" });
    }
    
    try {
        const user = await Users.findOne({
            where: { email: email }
        });
        
        if (!user) {
            return res.status(404).json({msg: "Email tidak ditemukan"});
        }
        
        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(400).json({msg: "Password salah"});
        
        const userId = user.id;
        const name = user.name;
        const userEmail = user.email;
        
        // ✅ UBAH: Perpanjang token expiry
        const accessToken = jwt.sign(
            { userId, name, email: userEmail }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: '1h' } // ✅ Ubah dari 15s ke 1 jam
        );
        
        const refreshToken = jwt.sign(
            { userId, name, email: userEmail }, 
            process.env.REFRESH_TOKEN_SECRET, 
            { expiresIn: '1d' }
        );
        
        await Users.update(
            { refresh_token: refreshToken }, 
            { where: { id: userId } }
        );
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        
        res.json({
            msg: "Login berhasil",
            accessToken,
            user: {
                id: userId,
                name: name,
                email: userEmail
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({msg: "Server error"});
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204); // No Content
    
    try {
        // ✅ Fix 1: Gunakan Users dan findOne()
        const user = await Users.findOne({
            where: {
                refresh_token: refreshToken
            }
        });
        
        // ✅ Fix 2: Cek user dengan benar
        if (!user) return res.sendStatus(204);
        
        // ✅ Fix 3: Langsung akses user.id (tanpa [0])
        const userId = user.id;
        
        // ✅ Fix 4: Gunakan Users konsisten
        await Users.update(
            { refresh_token: null }, 
            { where: { id: userId } }
        );
        
        res.clearCookie('refreshToken');
        res.json({ msg: "Logout berhasil" });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ msg: "Server error" });
    }
}