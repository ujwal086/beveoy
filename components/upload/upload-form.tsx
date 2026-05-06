"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Loader2, Upload, XCircle } from "lucide-react";

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("Drop a statement PDF here or browse from your device. PDFs must be 10 MB or smaller.");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function processFile(file: File | undefined) {
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

    setFileName(file.name);
    setState("uploading");
    setMessage("Analyzing your statement...");

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
    setMessage(`Analysis complete. Beveoy created ${result.transactionCount ?? 0} transaction records and updated your dashboard.`);
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await processFile(inputRef.current?.files?.[0]);
  }

  function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (inputRef.current && droppedFile) {
      const transfer = new DataTransfer();
      transfer.items.add(droppedFile);
      inputRef.current.files = transfer.files;
    }
    await processFile(droppedFile);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center transition ${
            isDragging ? "border-mint bg-mint/10" : "border-ink/20 bg-[#f7fbfa] hover:bg-white"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <FileText className="h-7 w-7 text-mint" />
          </div>
          <span className="mt-5 text-base font-semibold text-ink">Drag and drop your statement PDF</span>
          <span className="mt-2 max-w-md text-sm leading-6 text-ink/55">
            Upload bank statements, credit card statements, receipts, or bills. Beveoy reads the file, categorizes spending, and prepares your dashboard.
          </span>
          <div className="mt-5 inline-flex rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
            Browse files
          </div>
          <span className="mt-3 text-xs uppercase tracking-[0.16em] text-ink/45">PDF only · up to 10 MB</span>
          <input ref={inputRef} className="sr-only" type="file" accept="application/pdf" />
        </label>

        {fileName ? (
          <div className="rounded-md border border-ink/10 bg-[#f8fafb] px-4 py-3 text-sm text-ink/70">
            Ready to analyze: <span className="font-semibold text-ink">{fileName}</span>
          </div>
        ) : null}

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
          {state === "uploading" ? "Analyzing your statement..." : "Upload statement"}
        </button>
      </div>
    </form>
  );
}
