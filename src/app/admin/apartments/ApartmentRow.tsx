"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Apartment, ChecklistTemplate } from "@/types/database";
import { setApartmentTemplate } from "./actions";

export function ApartmentRow({
  apartment,
  templates,
}: {
  apartment: Apartment;
  templates: ChecklistTemplate[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(templateId: string) {
    startTransition(async () => {
      await setApartmentTemplate(apartment.id, templateId || null);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold">{apartment.name}</p>
        {apartment.address && <p className="text-xs text-adm-muted">{apartment.address}</p>}
        {apartment.notes && <p className="mt-1 text-xs text-adm-faint">{apartment.notes}</p>}
      </div>
      <select
        value={apartment.template_id ?? ""}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="shrink-0 rounded-lg bg-adm-hover px-2.5 py-1.5 text-xs disabled:opacity-50"
      >
        <option value="">Aucune checklist</option>
        {templates.map((tpl) => (
          <option key={tpl.id} value={tpl.id}>
            {tpl.name}
          </option>
        ))}
      </select>
    </div>
  );
}
