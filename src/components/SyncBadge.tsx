export function SyncBadge({ pending = 0 }: { pending?: number }) {
  const offline = pending > 0;

  return (
    <div
      className={`flex items-center gap-[9px] rounded-control px-[14px] py-[11px] ${
        offline ? "bg-warn-soft" : "bg-app-sunken"
      }`}
    >
      <span
        className={`size-2 shrink-0 rounded-full ${offline ? "bg-warn" : "bg-accent"}`}
      />
      <p className={`text-sm ${offline ? "text-warn" : "text-app-body"}`}>
        {offline
          ? `${pending} photo${pending > 1 ? "s" : ""} en attente d'envoi.`
          : "Tout est synchronisé"}
      </p>
    </div>
  );
}
