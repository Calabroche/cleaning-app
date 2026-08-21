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
        <h1 className="text-[15px] font-semibold">Vue d&apos;ensemble technique</h1>
        <p className="text-[13px] text-adm-muted">
          Accès développeur : comptes, sessions, performance. La gestion métier (planning,
          appartements, notifications) reste dans la{" "}
          <a href="/admin" className="text-adm-accent underline">
            vue admin
          </a>
          .
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-adm-surface p-[18px]">
          <p className="text-3xl font-semibold leading-tight">{employeeCount ?? 0}</p>
          <p className="mt-2 text-[13px] text-adm-muted">Employé·es</p>
        </div>
        <div className="rounded-xl bg-adm-surface p-[18px]">
          <p className="text-3xl font-semibold leading-tight">{adminCount ?? 0}</p>
          <p className="mt-2 text-[13px] text-adm-muted">Admins</p>
        </div>
        <div className="rounded-xl bg-adm-surface p-[18px]">
          <p className="text-3xl font-semibold leading-tight">{superAdminCount ?? 0}</p>
          <p className="mt-2 text-[13px] text-adm-muted">Super admins</p>
        </div>
        <div className="rounded-xl bg-adm-surface p-[18px]">
          <p className="text-3xl font-semibold leading-tight">{totalActivity ?? 0}</p>
          <p className="mt-2 text-[13px] text-adm-muted">Événements journalisés</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-label font-semibold tracking-label text-adm-muted">
          Performance & infrastructure (hors de cette app — dashboards natifs)
        </h2>
        <div className="divide-y divide-white/[0.06] rounded-xl bg-adm-surface">
          {externalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-3 hover:bg-adm-hover"
            >
              <div>
                <p className="text-[13px] font-medium">{link.label}</p>
                <p className="text-xs text-adm-faint">{link.detail}</p>
              </div>
              <span className="text-adm-faint">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
