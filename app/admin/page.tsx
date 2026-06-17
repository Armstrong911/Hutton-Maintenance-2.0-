import { requireSuperAdmin } from "@/lib/roleGuards";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { AddBuildingForm } from "@/components/maintenance/AddBuildingForm";
import { AddUserForm } from "@/components/maintenance/AddUserForm";
import Link from "next/link";

export default async function AdminPage({ searchParams }: { searchParams: { tab?: string } }) {
  await requireSuperAdmin();
  const tab = searchParams.tab ?? "buildings";

  const [buildings, users] = await Promise.all([
    prisma.building.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { maintenance: true, users: true } } } }),
    prisma.user.findMany({ orderBy: { email: "asc" }, include: { buildingRoles: { include: { building: { select: { name: true } } } } } }),
  ]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-zinc-50 min-h-screen">
        <div className="border-b border-zinc-200 bg-white px-8 h-14 flex items-center">
          <h1 className="font-serif font-bold">Super Admin</h1>
        </div>

        <div className="p-8">
          {/* Tab bar */}
          <div className="flex gap-0 mb-8 border-b border-zinc-200">
            {[["buildings","Buildings"],["users","Users"]].map(([key,label]) => (
              <Link key={key} href={`/admin?tab=${key}`}
                className={`font-serif text-sm px-6 py-3 border-b-2 transition-colors ${
                  tab === key ? "border-black text-black font-bold" : "border-transparent text-zinc-400 hover:text-black"
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {tab === "buildings" && (
            <div className="space-y-6 max-w-4xl">
              <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100">
                  <h2 className="font-serif font-bold">All Buildings ({buildings.length})</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr>{["Name","Strata Plan","Address","Records","Users",""].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {buildings.map(b => (
                      <tr key={b.id} className="hover:bg-zinc-50">
                        <td className="table-cell font-bold">
                          <Link href={`/buildings/${b.id}`} className="hover:underline">{b.name}</Link>
                        </td>
                        <td className="table-cell text-zinc-500">{b.strataPlan}</td>
                        <td className="table-cell text-zinc-500 text-xs">{b.address}</td>
                        <td className="table-cell text-center">{b._count.maintenance}</td>
                        <td className="table-cell text-center">{b._count.users}</td>
                        <td className="table-cell text-right">
                          <Link href={`/buildings/${b.id}`} className="text-xs text-zinc-400 hover:text-black font-serif">View →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <h2 className="font-serif font-bold mb-5">Add Building</h2>
                <AddBuildingForm />
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-6 max-w-4xl">
              <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100">
                  <h2 className="font-serif font-bold">All Users ({users.length})</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr>{["Email","Name","Role","Buildings",""].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-50">
                        <td className="table-cell">{u.email}</td>
                        <td className="table-cell text-zinc-500">{u.name ?? "—"}</td>
                        <td className="table-cell">
                          {u.isSuperAdmin
                            ? <span className="badge border-black bg-black text-white">Super Admin</span>
                            : <span className="badge border-zinc-200 bg-zinc-50 text-zinc-500">Standard</span>}
                        </td>
                        <td className="table-cell text-xs text-zinc-400">
                          {u.buildingRoles.map(r => r.building.name).join(", ") || "—"}
                        </td>
                        <td className="table-cell text-right">
                          <form action={`/api/users/${u.id}`} method="DELETE" className="inline">
                            <button type="submit" className="text-xs text-zinc-300 hover:text-red-600 font-serif transition-colors">
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <h2 className="font-serif font-bold mb-5">Add User</h2>
                <AddUserForm />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}