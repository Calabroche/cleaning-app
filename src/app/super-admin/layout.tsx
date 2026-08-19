import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/get-profile";
import { SuperAdminNav } from "@/components/SuperAdminNav";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();

  if (profile.role !== "super_admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-adm-bg text-adm-ink">
      <aside className="w-56 shrink-0 border-r border-white/[0.07] bg-adm-rail">
        <div className="border-b border-white/[0.07] px-[18px] py-5">
          <p className="text-[15px] font-semibold">Cleaning App</p>
          <p className="mt-1.5 text-label font-semibold tracking-label text-adm-muted">
            SUPER ADMIN (DEV)
          </p>
        </div>
        <SuperAdminNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/[0.07] bg-adm-rail px-6 py-3.5">
          <p className="text-[13px] text-adm-muted">
            Connecté en tant que{" "}
            <span className="font-medium text-adm-ink">{profile.full_name || profile.email}</span>
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle className="rounded-lg bg-adm-raised px-3 py-1.5 text-[12px] font-semibold text-adm-ink hover:bg-adm-hover" />
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
