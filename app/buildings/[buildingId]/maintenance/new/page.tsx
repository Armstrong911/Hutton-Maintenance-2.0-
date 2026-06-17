"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

const STATUSES = ["COMPLETED","SCHEDULED","IN_PROGRESS","CANCELLED"];

export default function NewMaintenanceRecordPage({ params }: { params: { buildingId: string } }) {
  const { buildingId } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      contractorName: form.get("contractorName"),
      description:    form.get("description"),
      workDate:       form.get("workDate"),
      price:          form.get("price"),
      status:         form.get("status"),
      invoiceNumber:  form.get("invoiceNumber"),
      notes:          form.get("notes"),
    };
    const res = await fetch(`/api/buildings/${buildingId}/maintenance`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!res.ok) { setError("Failed to save record."); setLoading(false); return; }
    router.push(`/buildings/${buildingId}/maintenance`);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar buildingId={buildingId} />
      <main className="flex-1 bg-zinc-50 min-h-screen">
        <div className="border-b border-zinc-200 bg-white px-8 h-14 flex items-center">
          <h1 className="font-serif font-bold">Add Maintenance Record</h1>
        </div>
        <div className="p-8 max-w-2xl">
          {error && <div className="border border-red-200 bg-red-50 text-red-700 text-sm font-serif px-4 py-3 mb-6">{error}</div>}
          <form onSubmit={handleSubmit} className="card space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="label">Contractor Name *</label>
                <input name="contractorName" required className="input" placeholder="ABC Roofing Ltd." />
              </div>
              <div>
                <label className="label">Invoice Number</label>
                <input name="invoiceNumber" className="input" placeholder="INV-0001" />
              </div>
            </div>
            <div>
              <label className="label">Work / Service Performed *</label>
              <textarea name="description" required rows={3} className="input resize-none"
                placeholder="Describe the work completed…" />
            </div>
            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="label">Date of Work *</label>
                <input name="workDate" type="date" required className="input"
                  defaultValue={new Date().toISOString().slice(0,10)} />
              </div>
              <div>
                <label className="label">Price (CAD) *</label>
                <input name="price" type="number" step="0.01" min="0" required className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" className="input">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea name="notes" rows={2} className="input resize-none" placeholder="Optional notes…" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5">
                {loading ? "Saving…" : "Save Record"}
              </button>
              <button type="button" className="btn-secondary px-6 py-2.5"
                onClick={() => router.back()}>Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}