"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/types/database";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non connecté.");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "super_admin") throw new Error("Accès refusé.");

  return user;
}

export async function forceSignOut(userId: string) {
  const actor = await requireSuperAdmin();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.signOut(userId, "global");
  if (error) return { error: error.message };

  await (await createClient()).from("activity_log").insert({
    profile_id: actor.id,
    action: "super_admin_force_signout",
    metadata: { target_user_id: userId },
  });

  revalidatePath("/super-admin/users");
  return { error: null };
}

export async function deleteAccount(userId: string) {
  const actor = await requireSuperAdmin();
  if (userId === actor.id) return { error: "Impossible de supprimer son propre compte." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  await (await createClient()).from("activity_log").insert({
    profile_id: actor.id,
    action: "super_admin_delete_account",
    metadata: { target_user_id: userId },
  });

  revalidatePath("/super-admin/users");
  return { error: null };
}

export async function setRole(userId: string, role: Role) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/super-admin/users");
  return { error: null };
}
