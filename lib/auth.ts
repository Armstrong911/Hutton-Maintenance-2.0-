import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email).toLowerCase() }
        })
        if (!user || !user.passwordHash || !user.isActive) return null
        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id           = user.id
        token.isSuperAdmin = (user as any).isSuperAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id           = token.id as string
        session.user.isSuperAdmin = token.isSuperAdmin as boolean
      }
      return session
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
