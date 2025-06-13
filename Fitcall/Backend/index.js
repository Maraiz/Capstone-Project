import express from 'express';
import dotenv from 'dotenv';
import db from './config/Database.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// import Users from './models/userModel.js';
// import WorkoutSessions from './models/WorkoutSessionModel.js';
import router from './routes/index.js';

dotenv.config();
const app = express();

console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET);
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('TOKEN')));

try {
    await db.authenticate();
    console.log('Database connected...');
    // await Users.sync();
    // await WorkoutSessions.sync();
} catch (error) {
    console.error('Database connection failed:', error);
}

// CORS configuration
app.use(cors({ 
    credentials: true, 
    origin: 'http://localhost:9000'
}));

app.use(cookieParser()); 

// UPDATE INI: Increase body parser limits untuk handle gambar base64
app.use(express.json({ 
    limit: '50mb',           // Increase dari default 1mb ke 50mb
    parameterLimit: 100000,  // Increase parameter limit
    extended: true 
}));

app.use(express.urlencoded({ 
    limit: '50mb',           // Increase limit untuk form data
    parameterLimit: 100000,
    extended: true 
}));

// Serve static files untuk uploaded images
app.use('/uploads', express.static('uploads'));

app.use(router);

app.listen(5000, () => console.log('Server is running on http://localhost:5000'));