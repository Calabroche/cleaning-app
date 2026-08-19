import { requireProfile } from "@/lib/get-profile";
import { AppTabBar } from "@/components/AppTabBar";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProfile();

  return (
    <div className="flex min-h-screen flex-col bg-app-bg text-app-ink">
      <main className="flex-1">{children}</main>
      <AppTabBar />
    </div>
  );
}
