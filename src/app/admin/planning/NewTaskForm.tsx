"use client";

import { useRef, useState, useTransition } from "react";
import type { Apartment, Profile } from "@/types/database";
import { createTask } from "./actions";

export function NewTaskForm({
  apartments,
  employees,
}: {
  apartments: Apartment[];
  employees: Profile[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createTask(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setError(null);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3 rounded-xl bg-adm-surface p-4">
      <h2 className="text-label font-semibold tracking-label text-adm-muted">Assigner une tâche</h2>

      <div className="grid grid-cols-2 gap-3">
        <select name="apartment_id" required className="rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none">
          <option value="">Appartement...</option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select name="assigned_to" required className="rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none">
          <option value="">Employé·e...</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name || e.email}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="scheduled_date"
          required
          className="rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none"
        />

        <input
          name="title"
          placeholder="Titre (ex: Ménage standard)"
          className="rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none placeholder:text-adm-faint"
        />
      </div>

      <textarea
        name="description"
        placeholder="Consignes particulières..."
        rows={2}
        className="w-full rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none placeholder:text-adm-faint"
      />

      <label className="flex items-center gap-2 text-[13px] text-adm-muted">
        <input type="checkbox" name="is_urgent" className="h-4 w-4" />
        Urgent (notifie immédiatement l&apos;employé·e)
      </label>

      {error && <p className="text-sm text-warn">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-adm-accent px-4 py-2 text-[13px] font-semibold text-on-accent-dark disabled:opacity-50"
      >
        {isPending ? "Ajout..." : "Assigner"}
      </button>
    </form>
  );
}
