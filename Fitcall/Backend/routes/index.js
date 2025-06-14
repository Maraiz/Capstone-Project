import express from 'express';
import { getUsers, Register, Login, Logout } from '../controllers/Users.js';
import { predictTabular, predictImage } from '../controllers/Models.js';
import { calculateWorkoutCalories, getAvailableExercises } from '../controllers/Fitness.js';
import { 
  saveWorkoutSession, 
  getWorkoutSessions, 
  getWorkoutSessionById,
  updateWorkoutSession,
  deleteWorkoutSession,
  getWorkoutStatistics
} from '../controllers/WorkoutSessions.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { refreshToken } from '../controllers/RefreshToken.js';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes Auth/User
router.get('/users', verifyToken, getUsers);
router.post('/users', Register);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);

// ML Prediction Routes
router.post('/predict', predictTabular);
router.post('/predict-image', upload.single('image'), predictImage);

// Fitness Routes
router.post('/calculate-workout', verifyToken, calculateWorkoutCalories);
router.get('/exercises', getAvailableExercises);

// Workout Session Routes (Protected)
router.post('/workout-sessions', verifyToken, saveWorkoutSession);
router.get('/workout-sessions', verifyToken, getWorkoutSessions);
router.get('/workout-sessions/statistics', verifyToken, getWorkoutStatistics);
router.get('/workout-sessions/:id', verifyToken, getWorkoutSessionById);
router.put('/workout-sessions/:id', verifyToken, updateWorkoutSession);
router.delete('/workout-sessions/:id', verifyToken, deleteWorkoutSession);

export default router;