import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client service_role : bypass RLS, ne doit jamais être importé depuis du
// code client. Réservé aux actions super-admin (déconnexion forcée,
// suppression de compte) qui doivent agir sur auth.users, hors de portée
// du client authentifié normal.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
