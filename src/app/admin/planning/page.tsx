import { requireProfile } from "@/lib/get-profile";
import type { Apartment, Profile, Task } from "@/types/database";
import { NewTaskForm } from "./NewTaskForm";
import { TaskRow } from "./TaskRow";

export default async function AdminPlanningPage() {
  const { supabase } = await requireProfile();

  const [{ data: apartments }, { data: employees }, { data: tasks }] = await Promise.all([
    supabase.from("apartments").select("*").order("name").returns<Apartment[]>(),
    // Tous les comptes, pas seulement role='employee' : Florian (super_admin) doit
    // pouvoir s'assigner des tâches à lui-même pour voir ce que voit un intervenant.
    supabase.from("profiles").select("*").order("full_name").returns<Profile[]>(),
    supabase
      .from("tasks")
      .select("*")
      .order("scheduled_date", { ascending: true })
      .returns<Task[]>(),
  ]);

  const apartmentById = new Map((apartments ?? []).map((a) => [a.id, a]));
  const employeeById = new Map((employees ?? []).map((e) => [e.id, e]));

  const grouped = (tasks ?? []).reduce<Record<string, Task[]>>((acc, t) => {
    (acc[t.scheduled_date] ??= []).push(t);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <h1 className="text-[15px] font-semibold">Planning</h1>

      <NewTaskForm apartments={apartments ?? []} employees={employees ?? []} />

      <div className="space-y-4">
        {dates.length === 0 && (
          <p className="rounded-xl bg-adm-surface p-6 text-center text-[13px] text-adm-faint">
            Aucune tâche planifiée.
          </p>
        )}
        {dates.map((date) => (
          <div key={date}>
            <h2 className="mb-2 text-label font-semibold tracking-label text-adm-muted">{date}</h2>
            <div className="divide-y divide-white/[0.06] rounded-xl bg-adm-surface">
              {grouped[date].map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  apartment={apartmentById.get(task.apartment_id) ?? null}
                  employee={task.assigned_to ? employeeById.get(task.assigned_to) ?? null : null}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
