import { requireProfile } from "@/lib/get-profile";

const externalLinks = [
  {
    label: "Vercel — Observability & Speed Insights",
    href: "https://vercel.com/calabroches-projects/cleaning-app/observability",
    detail: "Temps de réponse par route API (P50/P95), Web Vitals réels (TTFB, LCP, CLS, INP), logs des fonctions serverless.",
  },
  {
    label: "Vercel — Déploiements",
    href: "https://vercel.com/calabroches-projects/cleaning-app/deployments",
    detail: "Historique des builds/déploiements, statut, rollback.",
  },
  {
    label: "Supabase — Dashboard",
    href: "https://supabase.com/dashboard/project/sdrofjjmfysudncnqdxp",
    detail: "Base de données, requêtes SQL, stockage, logs auth.",
  },
  {
    label: "Google Cloud — Auth Platform",
    href: "https://console.cloud.google.com/auth/overview?project=cleaning-app-505913",
    detail: "Client OAuth Google, utilisateurs test, statut de publication.",
  },
];

export default async function SuperAdminOverviewPage() {
  const { supabase } = await requireProfile();

  const [{ count: employeeCount }, { count: adminCount }, { count: superAdminCount }, { count: totalActivity }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "employee"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "super_admin"),
      supabase.from("activity_log").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Vue d&apos;ensemble technique</h1>
        <p className="text-sm text-neutral-500">
          Accès développeur : comptes, sessions, performance. La gestion métier (planning,
          appartements, notifications) reste dans la{" "}
          <a href="/admin" className="underline">
            vue admin
          </a>
          .
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{employeeCount ?? 0}</p>
          <p className="text-sm text-neutral-500">Employé·es</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{adminCount ?? 0}</p>
          <p className="text-sm text-neutral-500">Admins</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{superAdminCount ?? 0}</p>
          <p className="text-sm text-neutral-500">Super admins</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{totalActivity ?? 0}</p>
          <p className="text-sm text-neutral-500">Événements journalisés</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">
          Performance & infrastructure (hors de cette app — dashboards natifs)
        </h2>
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white shadow-sm">
          {externalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
            >
              <div>
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-xs text-neutral-400">{link.detail}</p>
              </div>
              <span className="text-neutral-300">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
