"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type UploadedFileRow = {
  id: string;
  fileName: string;
  size: number;
  createdAt: string;
  transactionCount: number;
};

export function UploadedFiles({ files }: { files: UploadedFileRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteFile(id: string) {
    setDeletingId(id);

    const response = await fetch(`/api/upload/${id}`, {
      method: "DELETE"
    });

    setDeletingId(null);

    if (response.ok) {
      router.refresh();
    }
  }

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/20 bg-white p-8 text-center text-sm text-ink/55">
        Your uploaded statements will appear here. Files stay private to your account and are never shared as public links.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-paper text-ink/65">
          <tr>
            <th className="px-4 py-3 font-medium">File</th>
            <th className="px-4 py-3 font-medium">Uploaded</th>
            <th className="px-4 py-3 font-medium">Transactions</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {files.map((file) => (
            <tr key={file.id}>
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{file.fileName}</p>
                <p className="text-xs text-ink/50">{Math.round(file.size / 1024)} KB</p>
              </td>
              <td className="px-4 py-3 text-ink/70">{formatDate(file.createdAt)}</td>
              <td className="px-4 py-3 text-ink/70">{file.transactionCount}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => deleteFile(file.id)}
                  disabled={deletingId === file.id}
                  aria-label={`Delete ${file.fileName}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink hover:bg-ink/5 disabled:opacity-60"
                >
                  {deletingId === file.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
