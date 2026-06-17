import { requireAuth, requireBuildingAccess } from "@/lib/roleGuards";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function BuildingPage({ params }: { params: { buildingId: string } }) {
  const session = await requireAuth();
  const { buildingId } = params;
  const role = await requireBuildingAccess(session.user.id as string, buildingId);

  const building = await prisma.building.findUnique({ where: { id: buildingId } });
  if (!building) return <div>Not found</div>;

  const now = new Date();
  const ytdStart = new Date(now.getFullYear(), 0, 1);

  const [recentRecords, ytdTotal, totalRecords] = await Promise.all([
    prisma.maintenanceRecord.findMany({
      where: { buildingId },
      orderBy: { workDate: "desc" },
      take: 5,
      include: { createdBy: { select: { name: true, email: true } } },
    }),
    prisma.maintenanceRecord.aggregate({
      where: { buildingId, workDate: { gte: ytdStart } },
      _sum: { price: true },
    }),
    prisma.maintenanceRecord.count({ where: { buildingId } }),
  ]);

  const ytdSpend = Number(ytdTotal._sum.price ?? 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar buildingId={buildingId} buildingName={building.name} />
      <main className="flex-1 bg-zinc-50 min-h-screen">
        {/* Header */}
        <div className="border-b border-zinc-200 bg-white px-8 h-14 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-serif mr-3">{building.strataPlan}</span>
            <span className="font-serif font-bold">{building.name}</span>
          </div>
          {(role === "ADMINISTRATION" || role === "SUPER_ADMIN") && (
            <Link href={`/buildings/${buildingId}/maintenance/new`} className="btn-primary text-xs px-4 py-2">
              + Add Record
            </Link>
          )}
        </div>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "YTD Maintenance Spend", value: formatCurrency(ytdSpend) },
              { label: "Total Records", value: String(totalRecords) },
              { label: "Address", value: `${building.address}` },
              { label: "Province", value: `${building.city}, ${building.province}` },
            ].map(stat => (
              <div key={stat.label} className="card">
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-serif mb-2">{stat.label}</p>
                <p className="font-serif font-bold text-lg leading-tight">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-serif font-bold">Recent Activity</h2>
              <Link href={`/buildings/${buildingId}/maintenance`}
                className="text-xs text-zinc-400 hover:text-black font-serif transition-colors">
                View all →
              </Link>
            </div>
            {recentRecords.length === 0 ? (
              <p className="text-sm text-zinc-400 font-serif p-6">No maintenance records yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    {["Contractor","Work Performed","Date","Amount","Status"].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map(r => (
                    <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="table-cell font-bold">{r.contractorName}</td>
                      <td className="table-cell text-zinc-600 max-w-xs truncate">{r.description}</td>
                      <td className="table-cell text-zinc-500">{formatDate(r.workDate)}</td>
                      <td className="table-cell font-bold">{formatCurrency(r.price)}</td>
                      <td className="table-cell">
                        <span className={`badge badge-${r.status.toLowerCase().replace("_","-")}`}>
                          {r.status.replace("_"," ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}