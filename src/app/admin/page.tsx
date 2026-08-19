import { requireProfile } from "@/lib/get-profile";
import type { Apartment, Profile, Task, TaskItem } from "@/types/database";

type LiveTask = Task & {
  apartments: Pick<Apartment, "name"> | null;
  profiles: Pick<Profile, "full_name" | "email"> | null;
  task_items: Pick<TaskItem, "done_at">[];
};

function initials(name: string | null, email: string) {
  return (name ?? email).slice(0, 2).toUpperCase();
}

export default async function AdminOverviewPage() {
  const { supabase } = await requireProfile();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: todayTasks }, { count: pendingProofs }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, apartments(name), profiles!tasks_assigned_to_fkey(full_name, email), task_items(done_at)")
      .eq("scheduled_date", today)
      .returns<LiveTask[]>(),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "done")
      .is("validated_at", null),
  ]);

  const tasks = todayTasks ?? [];
  const done = tasks.filter((t) => t.status === "done").length;
  const late = tasks.filter((t) => t.status === "pending");
  const active = tasks.filter((t) => t.status === "in_progress");

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        <Stat label="AUJOURD'HUI" value={`${done}`} suffix={`/${tasks.length}`}>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-adm-track">
            <div
              className="h-full bg-adm-accent"
              style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </Stat>
        <div className="rounded-xl border border-warn-dark/30 bg-adm-surface p-[18px]">
          <p className="text-label font-semibold tracking-label text-warn-dark">EN RETARD</p>
          <p className="mt-2.5 text-3xl font-semibold leading-tight text-warn-dark">{late.length}</p>
          <p className="mt-3 text-xs text-adm-muted">
            {late.map((t) => t.apartments?.name).slice(0, 2).join(" · ") || "—"}
          </p>
        </div>
        <Stat label="PREUVES À VALIDER" value={`${pendingProofs ?? 0}`}>
          <a href="/admin/proofs" className="mt-3 block text-xs font-medium text-adm-accent">
            Ouvrir la file
          </a>
        </Stat>
        <Stat label="EN COURS" value={`${active.length}`}>
          <p className="mt-3 text-xs text-adm-muted">intervenants sur le terrain</p>
        </Stat>
      </div>

      <section className="overflow-hidden rounded-xl bg-adm-surface">
        <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-[18px] py-4">
          <span className="size-1.5 rounded-full bg-adm-accent" />
          <h2 className="text-[13px] font-semibold">En ce moment</h2>
        </header>
        {tasks.filter((t) => t.status !== "done").length === 0 && (
          <p className="px-[18px] py-4 text-[13px] text-adm-faint">Tout est terminé pour aujourd&apos;hui.</p>
        )}
        <ul>
          {tasks
            .filter((t) => t.status !== "done")
            .map((task) => {
              const total = task.task_items.length;
              const ticked = task.task_items.filter((i) => i.done_at).length;
              const isLate = task.status === "pending";
              return (
                <li
                  key={task.id}
                  className="flex items-center gap-3.5 border-t border-white/[0.06] px-[18px] py-3.5 first:border-t-0"
                >
                  <span
                    className={`flex size-[34px] shrink-0 items-center justify-center rounded-[10px] text-xs font-semibold ${
                      isLate ? "bg-warn-dark/15 text-warn-dark" : "bg-adm-raised text-adm-ink"
                    }`}
                  >
                    {initials(task.profiles?.full_name ?? null, task.profiles?.email ?? "??")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {task.profiles?.full_name || task.profiles?.email || "Non assigné"}
                    </p>
                    <p className={`mt-0.5 text-xs ${isLate ? "text-warn-dark" : "text-adm-muted"}`}>
                      {task.apartments?.name}
                      {isLate ? " · pas commencé" : ""}
                    </p>
                  </div>
                  <div className="w-28 shrink-0">
                    <div className="h-1.5 overflow-hidden rounded-full bg-adm-track">
                      <div
                        className="h-full bg-adm-accent"
                        style={{ width: `${total ? (ticked / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-semibold">
                    {ticked}/{total}
                  </span>
                </li>
              );
            })}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  children,
}: {
  label: string;
  value: string;
  suffix?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-adm-surface p-[18px]">
      <p className="text-label font-semibold tracking-label text-adm-muted">{label}</p>
      <p className="mt-2.5 text-3xl font-semibold leading-tight">
        {value}
        {suffix && <span className="text-base text-adm-faint">{suffix}</span>}
      </p>
      {children}
    </div>
  );
}
