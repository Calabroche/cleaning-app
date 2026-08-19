import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/get-profile";
import { SuperAdminNav } from "@/components/SuperAdminNav";
import { SignOutButton } from "@/components/SignOutButton";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();

  if (profile.role !== "super_admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-neutral-950">
        <div className="border-b border-neutral-800 px-4 py-4">
          <p className="text-sm font-semibold text-white">Cleaning App</p>
          <p className="text-xs text-neutral-400">Super admin (dev)</p>
        </div>
        <SuperAdminNav />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
          <p className="text-sm text-neutral-500">
            Connecté en tant que{" "}
            <span className="font-medium text-neutral-900">
              {profile.full_name || profile.email}
            </span>
          </p>
          <SignOutButton />
        </header>
        <main className="flex-1 bg-neutral-50 p-6">{children}</main>
      </div>
    </div>
  );
}
