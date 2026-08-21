import { requireProfile } from "@/lib/get-profile";
import { AdminNav } from "@/components/AdminNav";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireProfile();

  const { count: pendingProofs } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "done")
    .is("validated_at", null);

  const navHeader = (
    <div className="border-b border-white/[0.07] px-[18px] py-5">
      <p className="text-[15px] font-semibold">Cleaning App</p>
      <p className="mt-1.5 text-label font-semibold tracking-label text-adm-muted">ESPACE ADMIN</p>
    </div>
  );

  return (
    <div className="safe-area-screen flex min-h-screen bg-adm-bg text-adm-ink">
      <aside className="hidden w-54 shrink-0 flex-col border-r border-white/[0.07] bg-adm-rail md:flex">
        {navHeader}
        <AdminNav pendingProofs={pendingProofs ?? 0} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-adm-rail px-4 py-3.5 md:px-6">
          <div className="flex items-center gap-3">
            <MobileNavDrawer>
              {navHeader}
              <AdminNav pendingProofs={pendingProofs ?? 0} />
            </MobileNavDrawer>
            <p className="text-[13px] font-semibold md:text-[15px]">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 md:gap-3.5">
            <span className="hidden text-[13px] text-adm-muted sm:inline">
              {profile.full_name || profile.email}
            </span>
            <a href="/dashboard" className="text-[13px] text-adm-accent underline">
              Vue employé (aperçu) →
            </a>
            {profile.role === "super_admin" && (
              <a href="/super-admin" className="text-[13px] text-adm-accent underline">
                Vue super admin (dev) →
              </a>
            )}
            <ThemeToggle className="rounded-lg bg-adm-raised px-3 py-1.5 text-[12px] font-semibold text-adm-ink hover:bg-adm-hover" />
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
