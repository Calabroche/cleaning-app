import { requireProfile } from "@/lib/get-profile";
import type { Apartment, ChecklistTemplate } from "@/types/database";
import { NewApartmentForm } from "./NewApartmentForm";
import { ApartmentRow } from "./ApartmentRow";

export default async function AdminApartmentsPage() {
  const { supabase } = await requireProfile();

  const [{ data: apartments }, { data: templates }] = await Promise.all([
    supabase.from("apartments").select("*").order("name", { ascending: true }).returns<Apartment[]>(),
    supabase.from("checklist_templates").select("*").order("name").returns<ChecklistTemplate[]>(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-[15px] font-semibold">Appartements</h1>

      <NewApartmentForm templates={templates ?? []} />

      <div className="divide-y divide-white/[0.06] rounded-xl bg-adm-surface">
        {(!apartments || apartments.length === 0) && (
          <p className="p-4 text-[13px] text-adm-faint">Aucun appartement pour le moment.</p>
        )}
        {apartments?.map((apt) => (
          <ApartmentRow key={apt.id} apartment={apt} templates={templates ?? []} />
        ))}
      </div>
    </div>
  );
}
