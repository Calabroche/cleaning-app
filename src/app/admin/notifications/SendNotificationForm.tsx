"use client";

import { useRef, useState, useTransition } from "react";
import type { Profile } from "@/types/database";
import { sendNotification } from "./actions";

export function SendNotificationForm({ employees }: { employees: Profile[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await sendNotification(formData);
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
      <h2 className="text-sm font-medium text-neutral-500">Envoyer une notification</h2>

      <div className="grid grid-cols-2 gap-3">
        <select name="recipient_id" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          <option value="">Tout le monde</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name || e.email}
            </option>
          ))}
        </select>

        <select name="type" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          <option value="info">Info</option>
          <option value="reminder">Rappel</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <input
        name="title"
        placeholder="Titre"
        required
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <textarea
        name="body"
        placeholder="Message"
        rows={2}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
