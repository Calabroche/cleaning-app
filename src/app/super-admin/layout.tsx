import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/get-profile";
import { SuperAdminNav } from "@/components/SuperAdminNav";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();

  if (profile.role !== "super_admin") {
    redirect("/");
  }

  const navHeader = (
    <div className="border-b border-white/[0.07] px-[18px] py-5">
      <p className="text-[15px] font-semibold">Cleaning App</p>
      <p className="mt-1.5 text-label font-semibold tracking-label text-adm-muted">
        SUPER ADMIN (DEV)
      </p>
    </div>
  );

  return (
    <div className="safe-area-screen flex min-h-screen bg-adm-bg text-adm-ink">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/[0.07] bg-adm-rail md:flex">
        {navHeader}
        <SuperAdminNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-adm-rail px-4 py-3.5 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <MobileNavDrawer>
              {navHeader}
              <SuperAdminNav />
            </MobileNavDrawer>
            <p className="truncate text-[13px] text-adm-muted">
              Connecté en tant que{" "}
              <span className="font-medium text-adm-ink">{profile.full_name || profile.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="rounded-lg bg-adm-raised px-3 py-1.5 text-[12px] font-semibold text-adm-ink hover:bg-adm-hover" />
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
