import { requireProfile } from "@/lib/get-profile";
import type { Apartment, Profile, Task } from "@/types/database";
import { NewTaskForm } from "./NewTaskForm";
import { TaskRow } from "./TaskRow";

export default async function AdminPlanningPage() {
  const { supabase } = await requireProfile();

  const [{ data: apartments }, { data: employees }, { data: tasks }] = await Promise.all([
    supabase.from("apartments").select("*").order("name").returns<Apartment[]>(),
    supabase.from("profiles").select("*").eq("role", "employee").returns<Profile[]>(),
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
      <h1 className="text-lg font-semibold">Planning</h1>

      <NewTaskForm apartments={apartments ?? []} employees={employees ?? []} />

      <div className="space-y-4">
        {dates.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
            Aucune tâche planifiée.
          </p>
        )}
        {dates.map((date) => (
          <div key={date}>
            <h2 className="mb-2 text-sm font-medium text-neutral-500">{date}</h2>
            <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white shadow-sm">
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
