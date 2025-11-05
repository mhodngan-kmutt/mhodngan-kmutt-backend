import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and Service Role Key from environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validate environment variables
if (!supabaseUrl) {
    throw new Error('Missing Supabase URL in environment variables');
}

if (!supabaseKey) {
    throw new Error('Missing Supabase Service Role Key in environment variables');
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
});

console.log("Supabase client initialized with URL:", supabaseUrl);