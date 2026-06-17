import { requireAuth } from "@/lib/roleGuards";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";

export default async function BuildingsPage() {
  const session = await requireAuth();
  const userId = session.user.id as string;
  const isSuperAdmin = session.user.isSuperAdmin as boolean;

  const buildings = isSuperAdmin
    ? await prisma.building.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
    : await prisma.building.findMany({
        where: { isActive: true, users: { some: { userId } } },
        orderBy: { name: "asc" },
      });

  // Get YTD spend per building
  const now = new Date();
  const ytdStart = new Date(now.getFullYear(), 0, 1);
  const spendData = await prisma.maintenanceRecord.groupBy({
    by: ["buildingId"],
    where: { workDate: { gte: ytdStart }, buildingId: { in: buildings.map(b => b.id) } },
    _sum: { price: true },
  });
  const spendMap = Object.fromEntries(spendData.map(s => [s.buildingId, Number(s._sum.price ?? 0)]));

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-zinc-50 min-h-screen">
        <div className="border-b border-zinc-200 bg-white px-8 h-14 flex items-center justify-between">
          <h1 className="font-serif text-lg font-bold">Buildings</h1>
          {isSuperAdmin && (
            <Link href="/admin" className="btn-secondary text-xs px-4 py-2">Manage in Admin →</Link>
          )}
        </div>

        <div className="p-8">
          {buildings.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-zinc-400 font-serif">No buildings assigned. Contact your administrator.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {buildings.map((b) => (
                <Link key={b.id} href={`/buildings/${b.id}`}
                  className="card hover:border-zinc-400 transition-colors block group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400 font-serif mb-1">{b.strataPlan}</p>
                      <h2 className="font-serif font-bold text-lg leading-tight group-hover:underline">{b.name}</h2>
                    </div>
                    <span className="text-zinc-300 group-hover:text-black transition-colors font-serif">→</span>
                  </div>
                  <p className="text-sm text-zinc-500 font-serif mb-4">{b.address}, {b.city}</p>
                  <div className="border-t border-zinc-100 pt-3 mt-3">
                    <p className="text-xs text-zinc-400 font-serif">YTD Maintenance</p>
                    <p className="font-serif font-bold text-lg">
                      {new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(spendMap[b.id] ?? 0)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}