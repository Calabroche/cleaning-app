import { requireProfile } from "@/lib/get-profile";
import type { ChecklistItem, ChecklistTemplate } from "@/types/database";

const requirementBadge: Record<ChecklistItem["photo_requirement"], { label: string; tone: string }> = {
  none: { label: "SANS PHOTO", tone: "bg-adm-track text-adm-faint" },
  after: { label: "PHOTO APRÈS", tone: "bg-adm-accent/15 text-adm-accent" },
  before_after: { label: "AVANT + APRÈS", tone: "bg-adm-accent/15 text-adm-accent" },
};

export default async function AdminChecklistsPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const { supabase } = await requireProfile();

  const { data: templates } = await supabase
    .from("checklist_templates")
    .select("*")
    .order("name")
    .returns<ChecklistTemplate[]>();

  const selectedId = template ?? templates?.[0]?.id;

  const { data: items } = selectedId
    ? await supabase
        .from("checklist_items")
        .select("*")
        .eq("template_id", selectedId)
        .order("room")
        .order("position")
        .returns<ChecklistItem[]>()
    : { data: [] as ChecklistItem[] };

  const rooms = (items ?? []).reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    (acc[item.room] ??= []).push(item);
    return acc;
  }, {});

  const selected = templates?.find((t) => t.id === selectedId);
  const photoCount = (items ?? []).filter((i) => i.photo_requirement !== "none").length;

  return (
    <div className="flex gap-5">
      <div className="flex w-64 shrink-0 flex-col gap-2.5">
        {templates?.map((tpl) => {
          const active = tpl.id === selectedId;
          return (
            <a
              key={tpl.id}
              href={`/admin/checklists?template=${tpl.id}`}
              className={`rounded-xl p-4 ${active ? "bg-adm-accent text-on-accent-dark" : "bg-adm-surface"}`}
            >
              <p className="text-sm font-semibold">{tpl.name}</p>
              <p className={`mt-1 text-xs ${active ? "text-on-accent-dark/70" : "text-adm-muted"}`}>
                Modèle réutilisable
              </p>
            </a>
          );
        })}
      </div>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-adm-surface">
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-[18px]">
          <div>
            <h1 className="text-base font-semibold">{selected?.name ?? "Aucun modèle"}</h1>
            <p className="mt-1 text-xs text-adm-muted">
              {items?.length ?? 0} items · {photoCount} exigent une photo
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-[18px] p-5">
          {Object.entries(rooms).map(([room, roomItems]) => (
            <div key={room}>
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-label font-semibold tracking-label text-adm-muted">
                  {room.toUpperCase()} · {roomItems.length} ITEMS
                </h2>
              </div>
              <ul className="flex flex-col gap-1.5">
                {roomItems.map((item) => {
                  const badge = requirementBadge[item.photo_requirement];
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3.5 rounded-lg bg-adm-hover px-3.5 py-3"
                    >
                      <span className="flex-1 text-[13px]">{item.label}</span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] ${badge.tone}`}
                      >
                        {badge.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <footer className="mt-auto border-t border-white/[0.06] px-5 py-4">
          <p className="text-xs text-adm-faint">
            Les modifications s&apos;appliquent aux prochains ménages, pas à ceux en cours. Édition des
            modèles à venir — pour l&apos;instant, modifiable en SQL (table checklist_items).
          </p>
        </footer>
      </section>
    </div>
  );
}
