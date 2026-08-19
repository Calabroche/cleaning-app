"use client";

import { useRef, useState, useTransition } from "react";
import type { ChecklistTemplate } from "@/types/database";
import { createApartment } from "./actions";

export function NewApartmentForm({ templates }: { templates: ChecklistTemplate[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createApartment(formData);
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
      <h2 className="text-label font-semibold tracking-label text-adm-muted">Ajouter un appartement</h2>
      <input
        name="name"
        placeholder="Nom (ex: Studio Bellecour)"
        required
        className="w-full rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none placeholder:text-adm-faint"
      />
      <input
        name="address"
        placeholder="Adresse"
        className="w-full rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none placeholder:text-adm-faint"
      />
      <textarea
        name="notes"
        placeholder="Notes (code d'accès, consignes...)"
        rows={2}
        className="w-full rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none placeholder:text-adm-faint"
      />
      <select
        name="template_id"
        defaultValue=""
        className="w-full rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none"
      >
        <option value="">Checklist appliquée...</option>
        {templates.map((tpl) => (
          <option key={tpl.id} value={tpl.id}>
            {tpl.name}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-warn">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-adm-accent px-4 py-2 text-[13px] font-semibold text-on-accent-dark disabled:opacity-50"
      >
        {isPending ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}
