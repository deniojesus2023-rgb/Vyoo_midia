"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export default function UploadCreativeForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!file || !name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const id = crypto.randomUUID();
      const upload = await fetch(`/api/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!upload.ok) throw new Error("Falha ao enviar arquivo");
      const uploaded = await upload.json();
      const r = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "creative.create",
          payload: {
            name,
            url: `/api/media/${id}`,
            type: file.type.startsWith("video") ? "video" : "image",
            mimeType: uploaded.contentType,
            fileSize: uploaded.size,
          },
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Falha ao salvar");
      setName("");
      setFile(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="section-form">
      <label className="field">
        <span>Nome do conteúdo</span>
        <input
          className="vy-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Horários de outubro"
        />
      </label>
      <label className="upload">
        <Upload />
        <b>Selecionar imagem ou vídeo</b>
        <small>PNG, JPG, WebP ou MP4 · até 25 MB</small>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file && <span>{file.name}</span>}
      </label>
      {error && <p style={{ color: "#b4232a", fontSize: 12 }}>{error}</p>}
      <button
        className="vy-button"
        disabled={!file || !name || busy}
        onClick={send}
        style={{ alignSelf: "flex-start" }}
      >
        {busy ? "Enviando..." : "Enviar para análise"}
      </button>
    </div>
  );
}
