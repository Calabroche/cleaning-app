import Link from "next/link";
import { requireProfile } from "@/lib/get-profile";
import { SyncBadge } from "@/components/SyncBadge";
import type { Apartment, Task, TaskItem } from "@/types/database";

type TaskWithDetail = Task & {
  apartments: Pick<Apartment, "id" | "name" | "address" | "notes"> | null;
  task_items: Pick<TaskItem, "id" | "done_at">[];
};

function firstName(full: string | null, email: string) {
  return full?.split(" ")[0] ?? email.split("@")[0];
}

function progress(items: Pick<TaskItem, "done_at">[]) {
  const done = items.filter((i) => i.done_at).length;
  return { done, total: items.length, pct: items.length ? (done / items.length) * 100 : 0 };
}

export default async function DashboardPage() {
  const { supabase, profile } = await requireProfile();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("tasks")
    .select("*, apartments(id, name, address, notes), task_items(id, done_at)")
    .eq("assigned_to", profile.id)
    .eq("scheduled_date", today)
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<TaskWithDetail[]>();

  const tasks = data ?? [];
  const current = tasks.find((t) => t.status === "in_progress") ?? tasks.find((t) => t.status === "pending");
  const upcoming = tasks.filter((t) => t.id !== current?.id && t.status !== "done");
  const finished = tasks.filter((t) => t.status === "done");
  const stopIndex = current ? tasks.indexOf(current) + 1 : tasks.length;

  return (
    <div className="flex flex-col">
      <header className="px-[22px] pt-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-app-muted">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-1.5 text-[30px] font-semibold leading-tight tracking-[-0.02em]">
              Bonjour {firstName(profile.full_name, profile.email)}
            </h1>
          </div>
          <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-[15px] font-semibold text-accent">
            {(profile.full_name ?? profile.email).slice(0, 2).toUpperCase()}
          </div>
        </div>
        <p className="mt-3.5 text-[17px] leading-relaxed text-app-body">
          {tasks.length} appartement{tasks.length > 1 ? "s" : ""} aujourd&apos;hui, il t&apos;en reste{" "}
          {tasks.length - finished.length}.
        </p>
        <div className="mt-4">
          <SyncBadge />
        </div>
      </header>

      <div className="px-[18px]">
        {current && (
          <Link
            href={`/tasks/${current.id}`}
            className="mb-[22px] block rounded-hero bg-app-surface p-[22px] shadow-hero"
          >
            <div className="mb-4 flex items-center gap-[9px]">
              <span className="size-2 rounded-full bg-accent" />
              <span className="text-[13px] font-medium text-accent">
                {current.status === "in_progress" ? "En cours" : "À commencer"} · arrêt {stopIndex} sur {tasks.length}
              </span>
            </div>
            <h2 className="text-[25px] font-semibold leading-tight tracking-[-0.015em]">
              {current.apartments?.name ?? "Appartement"}
            </h2>
            {current.apartments?.address && (
              <p className="mt-1.5 text-base text-app-muted">{current.apartments.address}</p>
            )}
            {(() => {
              const p = progress(current.task_items);
              return (
                <>
                  <div className="mb-2 mt-5 flex items-baseline gap-2">
                    <span className="text-[34px] font-semibold leading-none">{p.done}</span>
                    <span className="text-[17px] text-app-muted">/ {p.total} items faits</span>
                  </div>
                  <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-app-track">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${p.pct}%` }} />
                  </div>
                </>
              );
            })()}
            <span className="flex h-[60px] items-center justify-center rounded-control bg-accent text-lg font-semibold text-white">
              {current.status === "in_progress" ? "Continuer" : "Commencer"}
            </span>
            {current.apartments?.notes && (
              <p className="mt-3.5 text-center text-sm text-app-faint">{current.apartments.notes}</p>
            )}
          </Link>
        )}

        {upcoming.length > 0 && (
          <>
            <h3 className="mb-3 text-sm font-medium text-app-muted">Ensuite</h3>
            <ul className="mb-[22px] flex flex-col gap-3">
              {upcoming.map((task, i) => (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="flex min-h-[56px] items-center gap-4 rounded-card bg-app-surface p-[18px] shadow-soft"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-app-bg text-[15px] font-semibold">
                      {stopIndex + i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] font-semibold leading-snug">
                        {task.apartments?.name ?? "Appartement"}
                      </span>
                      <span className="mt-1 block text-sm text-app-muted">
                        {task.task_items.length} items
                        {task.apartments?.address ? ` · ${task.apartments.address}` : ""}
                      </span>
                    </span>
                    {task.is_urgent && (
                      <span className="shrink-0 rounded-xl bg-warn-soft px-[11px] py-1.5 text-[11px] font-semibold text-warn">
                        Urgent
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {finished.map((task) => (
          <div key={task.id} className="flex items-center gap-4 rounded-card bg-app-sunken p-[18px]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[17px] font-semibold text-accent">
              ✓
            </span>
            <div>
              <p className="text-[17px] font-semibold leading-snug">{task.apartments?.name}</p>
              <p className="mt-1 text-sm text-app-muted">
                Terminé à{" "}
                {new Date(task.updated_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="rounded-card bg-app-sunken p-6 text-center text-[17px] text-app-muted">
            Rien de prévu aujourd&apos;hui.
          </p>
        )}
      </div>
    </div>
  );
}
