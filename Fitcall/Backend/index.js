import express from 'express';
import dotenv from 'dotenv';
import { db, supabase, testConnection } from './config/Database.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes/index.js';

// Load environment variables
dotenv.config();

console.log('🚀 Starting Express app...');
const app = express();

// === ENVIRONMENT DEBUG ===
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_URL preview:', process.env.SUPABASE_URL?.substring(0, 40) + '...');
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('ACCESS_TOKEN_SECRET exists:', !!process.env.ACCESS_TOKEN_SECRET);
console.log('REFRESH_TOKEN_SECRET exists:', !!process.env.REFRESH_TOKEN_SECRET);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Database connection function (untuk Supabase)
async function connectDatabase() {
  console.log('Attempting Supabase connection...');

  try {
    const connectionTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase connection timeout (10s)')), 10000)
    );

    await Promise.race([testConnection(), connectionTimeout]);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

// Middlewares
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || [];

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


app.use(cookieParser());

app.use(express.json({
  limit: '4mb',
  parameterLimit: 100000,
  extended: true
}));

app.use(express.urlencoded({
  limit: '4mb',
  parameterLimit: 100000,
  extended: true
}));

// Static files
// app.use('/uploads', express.static('uploads'));

// Routes
app.use(router);

// Health check dengan lazy Supabase connection
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await connectDatabase();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      provider: 'Supabase'
    });
  } catch (error) {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Error',
      provider: 'Supabase',
      error: error.message
    });
  }
});

// Supabase status check
app.get('/db-status', async (req, res) => {
  try {
    // Test dengan query ke tabel dummy
    const { data, error } = await supabase
      .from('__test_connection_dummy_table__')
      .select('*')
      .limit(1);
    
    // Jika error "table not found", berarti koneksi OK
    if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
      res.json({ 
        status: 'Connected', 
        provider: 'Supabase',
        connection_test: 'OK (Table not found as expected)',
        timestamp: new Date().toISOString()
      });
    } else if (!error) {
      // Tidak mungkin, tapi kalau ada datanya berarti koneksi OK
      res.json({ 
        status: 'Connected', 
        provider: 'Supabase',
        connection_test: 'OK',
        timestamp: new Date().toISOString()
      });
    } else {
      // Error lain (connection error)
      throw error;
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      provider: 'Supabase',
      message: error.message,
      error_code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// Supabase info endpoint (opsional - untuk debugging)
app.get('/supabase-info', async (req, res) => {
  try {
    // Cek tabel users
    const { data: usersTable, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    // Cek tabel workout_sessions
    const { data: workoutTable, error: workoutError } = await supabase
      .from('workout_sessions')
      .select('id')
      .limit(1);

    const tablesStatus = {
      users: !usersError ? 'exists' : 'not_found',
      workout_sessions: !workoutError ? 'exists' : 'not_found'
    };

    // Count users jika tabel ada
    let usersCount = 0;
    if (!usersError) {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      usersCount = count || 0;
    }

    res.json({
      status: 'OK',
      provider: 'Supabase',
      project_url: process.env.SUPABASE_URL,
      tables: tablesStatus,
      users_count: usersCount,
      ready_for_api: tablesStatus.users === 'exists' && tablesStatus.workout_sessions === 'exists',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      provider: 'Supabase',
      message: error.message,
      error_code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running with Supabase',
    provider: 'Supabase',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.path
  });
});

// Export app untuk development
export { app };

// 🚀 Development server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 DB status: http://localhost:${PORT}/db-status`);
  console.log(`📋 Supabase info: http://localhost:${PORT}/supabase-info`);
});

// ✅ Export untuk Vercel (optional - install serverless-http when deploying)
let serverlessHandler;
try {
  const serverless = await import('serverless-http');
  serverlessHandler = serverless.default(app);
} catch (error) {
  // serverless-http not installed, that's fine for development
  console.log('📝 Note: serverless-http not installed (not needed for development)');
}

export default serverlessHandler;