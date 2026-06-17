import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session
}

export async function requireSuperAdmin() {
  const session = await requireAuth()
  if (!session.user.isSuperAdmin) redirect('/buildings')
  return session
}

export async function getBuildingRole(userId: string, buildingId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.isSuperAdmin) return 'SUPER_ADMIN'
  const bu = await prisma.buildingUser.findUnique({
    where: { userId_buildingId: { userId, buildingId } }
  })
  return bu?.role ?? null
}

export async function requireBuildingAccess(userId: string, buildingId: string) {
  const role = await getBuildingRole(userId, buildingId)
  if (!role) redirect('/buildings')
  return role
}
