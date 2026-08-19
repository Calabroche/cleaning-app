import { requireProfile } from "@/lib/get-profile";
import { SyncBadge } from "@/components/SyncBadge";
import type { Apartment, Task } from "@/types/database";

type TaskWithApartment = Task & { apartments: Pick<Apartment, "name"> | null };

function statusBadge(task: Task): { label: string; tone: string } {
  if (task.redo_reason) return { label: "REPRISE DEMANDÉE", tone: "bg-warn-soft text-warn" };
  if (task.validated_at) return { label: "VALIDÉ", tone: "bg-accent-soft text-accent" };
  return { label: "À VALIDER", tone: "bg-app-track text-app-muted" };
}

export default async function ProfilePage() {
  const { supabase, profile } = await requireProfile();

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [{ count: menagesCeMois }, { count: photosCeMois }, { data: history }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", profile.id)
      .eq("status", "done")
      .gte("scheduled_date", monthStartStr),
    supabase
      .from("task_photos")
      .select("*", { count: "exact", head: true })
      .eq("uploaded_by", profile.id)
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("tasks")
      .select("*, apartments(name)")
      .eq("assigned_to", profile.id)
      .eq("status", "done")
      .order("updated_at", { ascending: false })
      .limit(10)
      .returns<TaskWithApartment[]>(),
  ]);

  return (
    <div className="flex flex-col px-[18px] pt-6 pb-4">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent">
          {(profile.full_name ?? profile.email).slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-[22px] font-semibold leading-tight">
            {profile.full_name || profile.email}
          </h1>
          <p className="mt-0.5 text-sm text-app-muted">
            Intervenant·e depuis{" "}
            {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-tile bg-app-surface p-4 shadow-soft">
          <p className="text-2xl font-semibold">{menagesCeMois ?? 0}</p>
          <p className="mt-1 text-xs text-app-muted">ménages ce mois</p>
        </div>
        <div className="rounded-tile bg-app-surface p-4 shadow-soft">
          <p className="text-2xl font-semibold">{photosCeMois ?? 0}</p>
          <p className="mt-1 text-xs text-app-muted">photos envoyées ce mois</p>
        </div>
      </div>

      <div className="mb-6">
        <SyncBadge />
      </div>

      <h2 className="mb-3 text-sm font-medium text-app-muted">Historique</h2>
      <div className="mb-6 flex flex-col gap-2.5">
        {(!history || history.length === 0) && (
          <p className="rounded-card bg-app-sunken p-6 text-center text-[15px] text-app-muted">
            Aucun ménage terminé pour le moment.
          </p>
        )}
        {history?.map((task) => {
          const badge = statusBadge(task);
          return (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-tile bg-app-surface px-[18px] py-3.5 shadow-soft"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">{task.apartments?.name ?? "Appartement"}</p>
                <p className="mt-0.5 text-xs text-app-muted">
                  {new Date(task.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold tracking-[0.06em] ${badge.tone}`}>
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="h-[52px] w-full rounded-control bg-app-surface text-[15px] font-semibold text-warn shadow-soft"
        >
          Déconnexion
        </button>
      </form>
    </div>
  );
}
