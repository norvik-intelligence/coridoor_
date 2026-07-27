"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, X } from "lucide-react";
import { getPublicEnv } from "@/lib/env";
import { uploadToPrivateStorage } from "@/lib/storage-upload";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFilename } from "@/lib/utils";

const MAX_SIZE_BYTES = 25 * 1024 * 1024;

export function DeliverableUploader({
  organisationId,
  engagementId,
  deliverableId,
  version
}: {
  organisationId: string;
  engagementId: string;
  deliverableId: string;
  version: number;
}) {
  const router = useRouter();
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  const upload = async () => {
    if (!file) return;
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setState("error");
      setMessage("Deliverables müssen als PDF hochgeladen werden.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setState("error");
      setMessage("Das PDF überschreitet die maximale Größe von 25 MB.");
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setState("error");
      setMessage("Der sichere Dokumentenspeicher ist noch nicht verbunden.");
      return;
    }

    setState("uploading");
    setMessage(null);
    setProgress(0);
    const path = [
      organisationId,
      engagementId,
      "deliverables",
      deliverableId,
      `v${version}-${sanitizeFilename(file.name)}`
    ].join("/");

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired");
      const env = getPublicEnv();
      await uploadToPrivateStorage({
        url: env.NEXT_PUBLIC_SUPABASE_URL,
        publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        accessToken: session.access_token,
        path,
        file,
        signalRef: xhrRef,
        onProgress: setProgress
      });

      const { error } = await supabase
        .from("deliverables")
        .update({ storage_path: path })
        .eq("id", deliverableId)
        .eq("engagement_id", engagementId);
      if (error) {
        await supabase.storage.from("deal-room-documents").remove([path]);
        throw new Error("Metadata could not be saved");
      }
      await supabase.from("audit_logs").insert({
        engagement_id: engagementId,
        organisation_id: organisationId,
        actor_id: session.user.id,
        action: "deliverable.file_uploaded",
        entity_type: "deliverable",
        entity_id: deliverableId,
        metadata: { version, filename: file.name }
      });

      setProgress(100);
      setState("done");
      setMessage("PDF sicher gespeichert und mit dem Deliverable verknüpft.");
      setFile(null);
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error && error.message === "Upload cancelled"
          ? "Der Upload wurde abgebrochen."
          : "Das PDF konnte nicht sicher hochgeladen werden."
      );
    }
  };

  return (
    <div className="deliverable-upload">
      <label>
        <span><FileUp size={14} aria-hidden="true" /> PDF-Datei</span>
        <input
          accept=".pdf,application/pdf"
          disabled={state === "uploading"}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setState("idle");
            setMessage(null);
          }}
          type="file"
        />
      </label>
      {state === "uploading" ? (
        <div className="upload-progress">
          <div><i style={{ width: `${progress}%` }} /></div>
          <span>{progress}%</span>
          <button
            aria-label="Upload abbrechen"
            onClick={() => xhrRef.current?.abort()}
            type="button"
          >
            <X size={15} />
          </button>
        </div>
      ) : null}
      {message ? (
        <p className={state === "error" ? "form-message form-message-error" : "form-message"}>
          {message}
        </p>
      ) : null}
      <button
        className="button button-ghost"
        disabled={!file || state === "uploading"}
        onClick={upload}
        type="button"
      >
        PDF sicher hochladen
      </button>
    </div>
  );
}
