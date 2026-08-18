import { requireProfile } from "@/lib/get-profile";
import type { Apartment } from "@/types/database";
import { NewApartmentForm } from "./NewApartmentForm";

export default async function AdminApartmentsPage() {
  const { supabase } = await requireProfile();

  const { data: apartments } = await supabase
    .from("apartments")
    .select("*")
    .order("name", { ascending: true })
    .returns<Apartment[]>();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Appartements</h1>

      <NewApartmentForm />

      <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white shadow-sm">
        {(!apartments || apartments.length === 0) && (
          <p className="p-4 text-sm text-neutral-400">Aucun appartement pour le moment.</p>
        )}
        {apartments?.map((apt) => (
          <div key={apt.id} className="px-4 py-3">
            <p className="font-medium">{apt.name}</p>
            {apt.address && <p className="text-sm text-neutral-500">{apt.address}</p>}
            {apt.notes && <p className="mt-1 text-xs text-neutral-400">{apt.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
