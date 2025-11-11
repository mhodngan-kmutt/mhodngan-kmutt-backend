import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

export async function getUserByProfile(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}
