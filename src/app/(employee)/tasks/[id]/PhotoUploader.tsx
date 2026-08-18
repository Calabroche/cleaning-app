"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logPhotoUpload } from "./actions";

export function PhotoUploader({ taskId }: { taskId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Non connecté.");
      setUploading(false);
      return;
    }

    const path = `${taskId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("task-photos")
      .upload(path, file);

    if (uploadError) {
      setError("Échec de l'envoi de la photo.");
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("task_photos").insert({
      task_id: taskId,
      uploaded_by: user.id,
      storage_path: path,
    });

    if (insertError) {
      setError("Photo envoyée mais non enregistrée.");
      setUploading(false);
      return;
    }

    await logPhotoUpload(taskId);

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
        {uploading ? "Envoi..." : "📷 Ajouter une photo"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
