import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase: SupabaseClient<Database> = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
