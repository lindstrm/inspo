"use client";

import { useRef, useState } from "react";

type Props = {
  onSaveUrl: (url: string) => Promise<boolean>;
  onUploadFiles: (files: readonly File[]) => Promise<void>;
  busy: boolean;
};

/** The registrar's intake: paste a URL and expose it, or hand over image files. */
export function CaptureBar({ onSaveUrl, onUploadFiles, busy }: Props) {
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    const saved = await onSaveUrl(trimmed);
    if (saved) setUrl("");
  };

  return (
    <form className="capture" onSubmit={submit}>
      <label htmlFor="capture-url" className="visually-hidden">
        URL to capture
      </label>
      <input
        id="capture-url"
        className="capture-input"
        type="text"
        placeholder="Paste a URL to expose…"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      <button className="btn-expose" type="submit" disabled={busy}>
        {busy ? "Exposing…" : "Expose"}
      </button>
      <button
        className="btn-upload"
        type="button"
        onClick={() => fileRef.current?.click()}
      >
        Upload
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          if (files.length > 0) void onUploadFiles(files);
          event.target.value = "";
        }}
      />
    </form>
  );
}
