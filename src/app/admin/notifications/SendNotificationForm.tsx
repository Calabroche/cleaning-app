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
    <form ref={formRef} action={handleSubmit} className="space-y-3 rounded-xl bg-adm-surface p-4">
      <h2 className="text-label font-semibold tracking-label text-adm-muted">Envoyer une notification</h2>

      <div className="grid grid-cols-2 gap-3">
        <select name="recipient_id" className="rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none">
          <option value="">Tout le monde</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name || e.email}
            </option>
          ))}
        </select>

        <select name="type" className="rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none">
          <option value="info">Info</option>
          <option value="reminder">Rappel</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <input
        name="title"
        placeholder="Titre"
        required
        className="w-full rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none placeholder:text-adm-faint"
      />
      <textarea
        name="body"
        placeholder="Message"
        rows={2}
        className="w-full rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none placeholder:text-adm-faint"
      />

      {error && <p className="text-sm text-warn">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-adm-accent px-4 py-2 text-[13px] font-semibold text-on-accent-dark disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
