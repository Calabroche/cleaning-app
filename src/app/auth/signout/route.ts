import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 : force le navigateur à refaire la requête de redirection en GET.
  // Sans ça, le 307 par défaut de NextResponse.redirect garde le POST
  // d'origine, et /login (qui n'a pas de handler POST) répond 405.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
