"use client";

import { useRef, useState, useTransition } from "react";
import { createApartment } from "./actions";

export function NewApartmentForm() {
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
    <form ref={formRef} action={handleSubmit} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-neutral-500">Ajouter un appartement</h2>
      <input
        name="name"
        placeholder="Nom (ex: Studio Bellecour)"
        required
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
      />
      <input
        name="address"
        placeholder="Adresse"
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
      />
      <textarea
        name="notes"
        placeholder="Notes (code d'accès, consignes...)"
        rows={2}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}
