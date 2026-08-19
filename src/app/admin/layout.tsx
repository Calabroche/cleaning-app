import { requireProfile } from "@/lib/get-profile";
import { AdminNav } from "@/components/AdminNav";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireProfile();

  const { count: pendingProofs } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "done")
    .is("validated_at", null);

  return (
    <div className="flex min-h-screen bg-adm-bg text-adm-ink">
      <aside className="w-54 shrink-0 border-r border-white/[0.07] bg-adm-rail">
        <div className="border-b border-white/[0.07] px-[18px] py-5">
          <p className="text-[15px] font-semibold">Cleaning App</p>
          <p className="mt-1.5 text-label font-semibold tracking-label text-adm-muted">
            ESPACE ADMIN
          </p>
        </div>
        <AdminNav pendingProofs={pendingProofs ?? 0} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/[0.07] bg-adm-rail px-6 py-3.5">
          <p className="text-[15px] font-semibold">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="flex items-center gap-3.5">
            <span className="text-[13px] text-adm-muted">{profile.full_name || profile.email}</span>
            {profile.role === "super_admin" && (
              <a href="/super-admin" className="text-[13px] text-adm-accent underline">
                Vue super admin (dev) →
              </a>
            )}
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
