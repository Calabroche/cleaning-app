import { requireProfile } from "@/lib/get-profile";
import { BottomNav } from "@/components/BottomNav";
import { SignOutButton } from "@/components/SignOutButton";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-semibold">
            {profile.full_name || profile.email}
          </p>
          <p className="text-xs text-neutral-400">Employé·e</p>
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1 bg-neutral-50 pb-4">{children}</main>
      <BottomNav />
    </div>
  );
}
