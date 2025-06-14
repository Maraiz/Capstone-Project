import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// ✅ Inisialisasi dotenv agar process.env bisa digunakan
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // gunakan service role agar bisa menulis ke storage
);

export default supabase;
