import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

type AuthSuccess = {
  success: true;
  user: User;
};

type AuthError = {
  success: false;
  error: {
    status: number;
    message: string;
    details?: string;
  };
};

export type AuthResult = AuthSuccess | AuthError;

export async function authenticateUser(
  authHeader: string | undefined
): Promise<AuthResult> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      error: {
        status: 401,
        message: "Missing or invalid authorization header",
      },
    };
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      success: false,
      error: {
        status: 401,
        message: "Unauthorized - Invalid or expired token",
        details: authError?.message,
      },
    };
  }

  return {
    success: true,
    user,
  };
}
