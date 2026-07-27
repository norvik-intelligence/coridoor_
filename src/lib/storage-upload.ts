import type { MutableRefObject } from "react";

export function uploadToPrivateStorage(input: {
  url: string;
  publishableKey: string;
  accessToken: string;
  path: string;
  file: File;
  signalRef: MutableRefObject<XMLHttpRequest | null>;
  onProgress: (progress: number) => void;
}) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    input.signalRef.current = request;
    const encodedPath = input.path.split("/").map(encodeURIComponent).join("/");
    request.open(
      "POST",
      `${input.url}/storage/v1/object/deal-room-documents/${encodedPath}`
    );
    request.setRequestHeader("Authorization", `Bearer ${input.accessToken}`);
    request.setRequestHeader("apikey", input.publishableKey);
    request.setRequestHeader("Content-Type", input.file.type);
    request.setRequestHeader("x-upsert", "false");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        input.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      input.signalRef.current = null;
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }
      reject(new Error("Storage upload failed"));
    };
    request.onerror = () => {
      input.signalRef.current = null;
      reject(new Error("Network error"));
    };
    request.onabort = () => {
      input.signalRef.current = null;
      reject(new Error("Upload cancelled"));
    };
    request.send(input.file);
  });
}
