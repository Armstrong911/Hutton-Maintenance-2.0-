import { requireAuth, requireBuildingAccess } from "@/lib/roleGuards";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { MaintenanceTable } from "@/components/maintenance/MaintenanceTable";
import Link from "next/link";

export default async function MaintenancePage({ params, searchParams }: {
  params: { buildingId: string };
  searchParams: { search?: string; status?: string; year?: string };
}) {
  const session = await requireAuth();
  const { buildingId } = params;
  const role = await requireBuildingAccess(session.user.id as string, buildingId);
  const building = await prisma.building.findUnique({ where: { id: buildingId } });
  if (!building) return <div>Not found</div>;

  const year  = searchParams.year   ? parseInt(searchParams.year)  : new Date().getFullYear();
  const search = searchParams.search ?? "";
  const status = searchParams.status ?? "";

  const where: any = { buildingId, workDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } };
  if (status) where.status = status;
  if (search) where.OR = [
    { contractorName: { contains: search, mode: "insensitive" } },
    { description:    { contains: search, mode: "insensitive" } },
    { invoiceNumber:  { contains: search, mode: "insensitive" } },
  ];

  const [records, ytdTotal] = await Promise.all([
    prisma.maintenanceRecord.findMany({ where, orderBy: { workDate: "desc" }, include: { createdBy: { select: { name: true } } } }),
    prisma.maintenanceRecord.aggregate({ where: { buildingId, workDate: { gte: new Date(year, 0, 1), lt: new Date(year+1, 0, 1) } }, _sum: { price: true } }),
  ]);

  const ytdSpend = Number(ytdTotal._sum.price ?? 0);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const canEdit = role === "ADMINISTRATION" || role === "SUPER_ADMIN";

  return (
    <div className="flex min-h-screen">
      <Sidebar buildingId={buildingId} buildingName={building.name} />
      <main className="flex-1 bg-zinc-50 min-h-screen">
        <div className="border-b border-zinc-200 bg-white px-8 h-14 flex items-center justify-between">
          <h1 className="font-serif font-bold">{building.name} · Maintenance Log</h1>
          {canEdit && (
            <Link href={`/buildings/${buildingId}/maintenance/new`} className="btn-primary text-xs px-4 py-2">
              + Add Record
            </Link>
          )}
        </div>

        <div className="p-8 space-y-6">
          {/* Filters */}
          <div className="card flex flex-wrap gap-4 items-end">
            <form className="flex flex-wrap gap-4 items-end w-full" method="GET">
              <div>
                <label className="label">Year</label>
                <select name="year" defaultValue={year} className="input w-28"
                  onChange="this.form.submit()">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" defaultValue={status} className="input w-40">
                  <option value="">All</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="flex-1 min-w-48">
                <label className="label">Search</label>
                <input name="search" defaultValue={search} className="input" placeholder="Contractor, description…" />
              </div>
              <button type="submit" className="btn-secondary px-5 py-2.5 text-sm">Filter</button>
              {(search || status) && (
                <a href={`/buildings/${buildingId}/maintenance?year=${year}`} className="text-sm text-zinc-400 hover:text-black font-serif self-center">Clear</a>
              )}
            </form>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <p className="label">Total {year} Spend</p>
              <p className="font-serif font-bold text-2xl">
                {new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(ytdSpend)}
              </p>
            </div>
            <div className="card">
              <p className="label">Records ({year})</p>
              <p className="font-serif font-bold text-2xl">{records.length}</p>
            </div>
          </div>

          {/* Table */}
          <MaintenanceTable records={records} buildingId={buildingId} canEdit={canEdit} />
        </div>
      </main>
    </div>
  );
}