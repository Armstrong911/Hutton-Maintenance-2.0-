import { requireAuth, requireBuildingAccess } from "@/lib/roleGuards";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { AddBuildingUserForm } from "@/components/maintenance/AddBuildingUserForm";

export default async function BuildingUsersPage({ params }: { params: { buildingId: string } }) {
  const session = await requireAuth();
  const { buildingId } = params;
  const role = await requireBuildingAccess(session.user.id as string, buildingId);
  if (role !== "ADMINISTRATION" && role !== "SUPER_ADMIN") {
    return <div className="p-8 font-serif text-zinc-500">Access denied.</div>;
  }

  const building = await prisma.building.findUnique({ where: { id: buildingId } });
  const buildingUsers = await prisma.buildingUser.findMany({
    where: { buildingId },
    include: { user: { select: { id: true, name: true, email: true, isActive: true } } },
    orderBy: { role: "asc" },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar buildingId={buildingId} buildingName={building?.name} />
      <main className="flex-1 bg-zinc-50 min-h-screen">
        <div className="border-b border-zinc-200 bg-white px-8 h-14 flex items-center">
          <h1 className="font-serif font-bold">{building?.name} · Users</h1>
        </div>

        <div className="p-8 space-y-6 max-w-3xl">
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="font-serif font-bold">Building Users</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  {["Name","Email","Role",""].map(h => <th key={h} className="table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {buildingUsers.map(bu => (
                  <tr key={bu.id} className="hover:bg-zinc-50">
                    <td className="table-cell font-bold">{bu.user.name ?? "—"}</td>
                    <td className="table-cell text-zinc-500">{bu.user.email}</td>
                    <td className="table-cell">
                      <span className="badge border-zinc-200 bg-zinc-50 text-zinc-600">
                        {bu.role.replace("_"," ")}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <form action={`/api/buildings/${buildingId}/users/${bu.id}`} method="DELETE">
                        <button type="submit" className="text-xs text-zinc-400 hover:text-red-600 font-serif transition-colors">
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2 className="font-serif font-bold mb-4">Add User to Building</h2>
            <AddBuildingUserForm buildingId={buildingId} />
          </div>
        </div>
      </main>
    </div>
  );
}