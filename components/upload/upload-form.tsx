"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Loader2, Upload, XCircle } from "lucide-react";

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("Choose a financial PDF to extract transactions. PDFs must be 10 MB or smaller.");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setState("error");
      setMessage("Please select a PDF before uploading.");
      return;
    }

    if (file.type !== "application/pdf") {
      setState("error");
      setMessage("Beveoy only accepts PDF files.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setState("error");
      setMessage("PDFs must be 10 MB or smaller.");
      return;
    }

    setState("uploading");
    setMessage("Uploading and reading your PDF...");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const result = (await response.json()) as { message?: string; transactionCount?: number };

    if (!response.ok) {
      setState("error");
      setMessage(result.message ?? "Something went wrong while uploading the PDF.");
      return;
    }

    setState("success");
    setMessage(`Done. Beveoy created ${result.transactionCount ?? 0} transaction records.`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ink/20 bg-paper px-6 py-10 text-center hover:bg-white">
          <FileText className="mb-3 h-9 w-9 text-mint" />
          <span className="text-sm font-semibold text-ink">Select PDF</span>
          <span className="mt-1 text-sm text-ink/55">Bank statements, card statements, bills, or receipts</span>
          <input ref={inputRef} className="sr-only" type="file" accept="application/pdf" />
        </label>

        <div className="flex items-center gap-2 text-sm text-ink/65">
          {state === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-mint" />}
          {state === "success" && <CheckCircle2 className="h-4 w-4 text-mint" />}
          {state === "error" && <XCircle className="h-4 w-4 text-coral" />}
          <span>{message}</span>
        </div>

        <button
          type="submit"
          disabled={state === "uploading"}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload PDF
        </button>
      </div>
    </form>
  );
}
