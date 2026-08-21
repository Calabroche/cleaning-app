"use client";

import { useState } from "react";

export function MobileNavDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-adm-raised text-adm-ink md:hidden"
      >
        ☰
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            className="safe-area-screen absolute inset-y-0 left-0 flex w-64 flex-col overflow-y-auto bg-adm-rail"
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}
