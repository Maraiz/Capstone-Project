import express from 'express';
import dotenv from 'dotenv';
import db from './config/Database.js';
import cookieParser from 'cookie-parser';
// import Users from './models/userModel.js';
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
} catch (error) {
    console.error('Database connection failed:', error);
}

app.use(cookieParser()); 
app.use(express.json());
app.use(router);

app.listen(5000, () => console.log('Server is running on http://localhost:5000'));