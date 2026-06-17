"use client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";

interface Record {
  id: string; contractorName: string; description: string;
  workDate: string | Date; price: any; status: string;
  invoiceNumber?: string | null; notes?: string | null;
}

export function MaintenanceTable({ records, buildingId, canEdit }: {
  records: Record[]; buildingId: string; canEdit: boolean;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this record?")) return;
    setDeleting(id);
    await fetch(`/api/buildings/${buildingId}/maintenance/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (records.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-zinc-400 font-serif">No records found. Adjust your filters or add a record.</p>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr>
            {["Contractor","Work Performed","Date","Invoice #","Amount","Status",""].map(h => (
              <th key={h} className="table-header">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
              <td className="table-cell font-bold">{r.contractorName}</td>
              <td className="table-cell text-zinc-600 max-w-xs">
                <span title={r.description} className="line-clamp-2">{r.description}</span>
                {r.notes && <p className="text-xs text-zinc-400 mt-0.5">{r.notes}</p>}
              </td>
              <td className="table-cell text-zinc-500 whitespace-nowrap">{formatDate(r.workDate)}</td>
              <td className="table-cell text-zinc-400 text-xs">{r.invoiceNumber ?? "—"}</td>
              <td className="table-cell font-bold whitespace-nowrap">{formatCurrency(r.price)}</td>
              <td className="table-cell">
                <span className={`badge badge-${r.status.toLowerCase().replace("_","-")}`}>
                  {r.status.replace("_"," ")}
                </span>
              </td>
              <td className="table-cell text-right">
                {canEdit && (
                  <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                    className="text-xs text-zinc-300 hover:text-red-600 font-serif transition-colors">
                    {deleting === r.id ? "…" : "Delete"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-zinc-50">
            <td colSpan={4} className="px-4 py-3 text-xs text-zinc-400 font-serif">Total ({records.length} records)</td>
            <td className="px-4 py-3 font-serif font-bold text-sm">
              {formatCurrency(records.reduce((sum, r) => sum + Number(r.price ?? 0), 0))}
            </td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}