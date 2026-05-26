const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!rawSupabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL belum tersedia. Tambahkan ke .env.local.",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum tersedia. Tambahkan ke .env.local.",
  );
}

export const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/$/, "");

export const supabaseAnonKey = supabasePublishableKey;
