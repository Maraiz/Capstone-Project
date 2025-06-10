import express from 'express';
import { getUsers, Register, Login, Logout } from '../controllers/Users.js';
import { predictTabular, predictImage } from '../controllers/Models.js';
import { calculateWorkoutCalories, getAvailableExercises } from '../controllers/Fitness.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { refreshToken } from '../controllers/RefreshToken.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Routes Auth/User
router.get('/users', verifyToken, getUsers);
router.post('/users', Register);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);

// ML Prediction Routes
router.post('/predict', predictTabular);
router.post('/predict-image', upload.single('image'), predictImage);

// Fitness Routes (hanya 2 route)
router.post('/calculate-workout', verifyToken, calculateWorkoutCalories);
router.get('/exercises', getAvailableExercises);

export default router;