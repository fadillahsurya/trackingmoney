import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseAnonKey, supabaseUrl } from "./config";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
