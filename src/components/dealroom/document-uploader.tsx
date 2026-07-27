"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getPublicEnv } from "@/lib/env";
import { uploadToPrivateStorage } from "@/lib/storage-upload";
import type { DocumentCategory } from "@/lib/types";
import { buildStoragePath, validateUpload } from "@/lib/upload";

type RequestOption = {
  id: string;
  title: string;
  category: DocumentCategory;
};

export function DocumentUploader({
  organisationId,
  engagementId,
  requestOptions,
  maxSizeMb
}: {
  organisationId: string;
  engagementId: string;
  requestOptions: RequestOption[];
  maxSizeMb: number;
}) {
  const router = useRouter();
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [requestId, setRequestId] = useState(requestOptions[0]?.id ?? "");
  const [category, setCategory] = useState<DocumentCategory>(
    requestOptions[0]?.category ?? "other"
  );
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const chooseRequest = (id: string) => {
    setRequestId(id);
    const request = requestOptions.find((option) => option.id === id);
    if (request) setCategory(request.category);
  };

  const upload = async () => {
    if (!file) return;
    const validation = validateUpload(file, maxSizeMb);
    if (!validation.valid) {
      setError(validation.error);
      setState("error");
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setError("Der sichere Dokumentenspeicher ist noch nicht verbunden.");
      setState("error");
      return;
    }
    setState("uploading");
    setError(null);
    setProgress(0);
    const documentId = crypto.randomUUID();
    const path = buildStoragePath({
      organisationId,
      engagementId,
      category,
      documentId,
      filename: file.name
    });

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

      const { error: documentError } = await supabase.from("documents").insert({
        id: documentId,
        organisation_id: organisationId,
        engagement_id: engagementId,
        request_id: requestId || null,
        uploaded_by: session.user.id,
        storage_path: path,
        original_filename: file.name,
        sanitized_filename: path.split("/").at(-1),
        mime_type: file.type,
        file_size: file.size,
        category,
        description: description || null,
        document_year: year ? Number(year) : null,
        status: "uploaded",
        current_version: 1
      });
      if (documentError) {
        await supabase.storage.from("deal-room-documents").remove([path]);
        throw new Error("Metadata could not be saved");
      }
      await supabase.from("document_versions").insert({
        document_id: documentId,
        version: 1,
        storage_path: path,
        uploaded_by: session.user.id,
        original_filename: file.name,
        sanitized_filename: path.split("/").at(-1),
        mime_type: file.type,
        file_size: file.size
      });
      await supabase.from("audit_logs").insert({
        engagement_id: engagementId,
        organisation_id: organisationId,
        actor_id: session.user.id,
        action: "document.uploaded",
        entity_type: "document",
        entity_id: documentId,
        metadata: { category, request_id: requestId || null }
      });
      setProgress(100);
      setState("done");
      setFile(null);
      setDescription("");
      setYear("");
      router.refresh();
    } catch (uploadError) {
      setState("error");
      setError(
        uploadError instanceof Error && uploadError.message === "Upload cancelled"
          ? "Der Upload wurde abgebrochen."
          : "Die Datei konnte nicht sicher hochgeladen werden. Bitte versuchen Sie es erneut."
      );
    }
  };

  return (
    <section className="upload-panel">
      <div className="upload-panel-head">
        <div>
          <p className="micro-label">Direkter verschlüsselter Transport</p>
          <h2>Dokument hochladen</h2>
        </div>
        <FileUp size={28} strokeWidth={1.4} aria-hidden="true" />
      </div>
      <div className="upload-grid">
        <label>
          Dokumentenanforderung
          <select value={requestId} onChange={(event) => chooseRequest(event.target.value)}>
            <option value="">Zusätzliches Dokument</option>
            {requestOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.title}</option>
            ))}
          </select>
        </label>
        <label>
          Kategorie
          <select value={category} onChange={(event) => setCategory(event.target.value as DocumentCategory)}>
            {["corporate", "financial", "customers", "commercial", "management", "operations", "legal", "tax", "technology", "contracts", "other"].map((value) => (
              <option key={value} value={value}>{value[0]!.toUpperCase() + value.slice(1)}</option>
            ))}
          </select>
        </label>
        <label>
          Dokumentenjahr
          <input max="2200" min="1900" onChange={(event) => setYear(event.target.value)} type="number" value={year} />
        </label>
        <label className="upload-description">
          Beschreibung
          <input onChange={(event) => setDescription(event.target.value)} placeholder="Optionaler Kontext zur Datei" value={description} />
        </label>
      </div>
      <label className="file-drop">
        <input
          accept=".pdf,.xlsx,.xls,.csv,.docx,.pptx,.png,.jpg,.jpeg"
          disabled={state === "uploading"}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError(null);
            setState("idle");
          }}
          type="file"
        />
        <FileUp size={24} strokeWidth={1.4} aria-hidden="true" />
        <span>{file ? file.name : "Datei auswählen oder hier ablegen"}</span>
        <small>PDF, Office, CSV, PNG oder JPG · maximal {maxSizeMb} MB</small>
      </label>
      {state === "uploading" && (
        <div className="upload-progress">
          <div><i style={{ width: `${progress}%` }} /></div>
          <span>{progress}%</span>
          <button onClick={() => xhrRef.current?.abort()} type="button" aria-label="Upload abbrechen">
            <X size={15} />
          </button>
        </div>
      )}
      {error && <div className="form-message form-message-error">{error}</div>}
      {state === "done" && <div className="form-message">Dokument sicher übertragen.</div>}
      <button className="button button-dark" disabled={!file || state === "uploading"} onClick={upload} type="button">
        Sicher hochladen
      </button>
    </section>
  );
}
