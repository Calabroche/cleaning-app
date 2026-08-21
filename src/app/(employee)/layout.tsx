import { requireProfile } from "@/lib/get-profile";
import { AppTabBar } from "@/components/AppTabBar";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile();
  const isAdmin = profile.role === "admin" || profile.role === "super_admin";

  return (
    <div className="safe-area-screen flex min-h-screen flex-col bg-app-bg text-app-ink">
      {isAdmin && (
        <a
          href={profile.role === "super_admin" ? "/super-admin" : "/admin"}
          className="bg-app-ink px-4 py-2 text-center text-xs font-medium text-app-surface"
        >
          Aperçu de l&apos;app employé · ← retour à ton espace
        </a>
      )}
      <main className="flex-1">{children}</main>
      <AppTabBar />
    </div>
  );
}
