// config/Database.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Debug environment variables
console.log('🔧 Database.js - Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Validasi environment variables
if (!process.env.SUPABASE_URL) {
    console.error('❌ SUPABASE_URL is missing!');
    process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing!');
    process.exit(1);
}

// Buat Supabase client dengan service role key (untuk backend)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Bypass RLS untuk backend operations
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        db: {
            schema: 'public'
        }
    }
);

// Opsional: Buat client kedua dengan anon key (untuk frontend-like operations)
const supabaseAnon = process.env.SUPABASE_ANON_KEY ? createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true
        }
    }
) : null;

// Test connection function
async function testConnection() {
    try {
        console.log('🔄 Testing Supabase connection...');
        
        // Test dengan tabel users yang sudah ada
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
        
        if (!usersError) {
            console.log('✅ Supabase connection successful! Users table ready.');
            return true;
        }
        
        // Jika users table belum ada
        if (usersError && (usersError.code === '42P01' || usersError.message.includes('does not exist'))) {
            console.log('⚠️  Supabase connection OK, but users table not found.');
            console.log('   Please create the users table using the provided SQL.');
            return true; // Connection OK, hanya tabel belum ada
        }
        
        // Error lain
        console.error('❌ Supabase connection failed:', usersError.message);
        console.error('Error code:', usersError.code);
        return false;
        
    } catch (err) {
        console.error('❌ Supabase connection error:', err.message);
        return false;
    }
}

// Auto-test connection on startup (except in test environment)
if (process.env.NODE_ENV !== 'test') {
    testConnection();
}

// Export main client
export const db = supabase;
export { supabase, supabaseAnon, testConnection };
export default supabase;