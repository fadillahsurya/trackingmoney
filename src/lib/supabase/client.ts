import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseAnonKey, supabaseUrl } from "./config";

export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);
