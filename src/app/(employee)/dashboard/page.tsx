import Link from "next/link";
import { requireProfile } from "@/lib/get-profile";
import type { Apartment, Task } from "@/types/database";

type TaskWithApartment = Task & { apartments: Pick<Apartment, "id" | "name" | "address"> | null };

const statusLabel: Record<Task["status"], string> = {
  pending: "À faire",
  in_progress: "En cours",
  done: "Terminé",
  skipped: "Reporté",
};

const statusColor: Record<Task["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
  skipped: "bg-neutral-200 text-neutral-600",
};

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";

  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default async function DashboardPage() {
  const { supabase, profile } = await requireProfile();

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, apartments(id, name, address)")
    .eq("assigned_to", profile.id)
    .gte("scheduled_date", todayStr)
    .neq("status", "done")
    .order("scheduled_date", { ascending: true })
    .returns<TaskWithApartment[]>();

  const grouped = (tasks ?? []).reduce<Record<string, TaskWithApartment[]>>((acc, task) => {
    (acc[task.scheduled_date] ??= []).push(task);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort();

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <h1 className="mb-4 text-lg font-semibold">Mon planning</h1>

      {dates.length === 0 && (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
          Aucune tâche à venir pour le moment.
        </p>
      )}

      <div className="space-y-6">
        {dates.map((date) => (
          <div key={date}>
            <h2 className="mb-2 text-sm font-medium capitalize text-neutral-500">
              {formatDate(date)}
            </h2>
            <div className="space-y-2">
              {grouped[date].map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="flex items-center gap-1.5 font-medium">
                      {task.is_urgent && <span className="text-red-500">⚠</span>}
                      {task.apartments?.name ?? "Appartement"}
                    </p>
                    {task.apartments?.address && (
                      <p className="text-xs text-neutral-400">{task.apartments.address}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[task.status]}`}
                  >
                    {statusLabel[task.status]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
