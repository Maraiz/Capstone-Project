import express from 'express';
import db from './config/Database.js';
import Users from './models/userModel.js';
import router from './routes/index.js';
const app = express();

try {
    await db.authenticate();
    console.log('Database connected...');
    await Users.sync();
} catch (error) {
    console.error('Database connection failed:', error);
}

app.use(express.json());
app.use(router);

app.listen(5000, () => console.log('Server is running on http://localhost:5000'));