import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        // Mock Super Admin
        if (credentials.email === "super@skillbridge.ai" && credentials.password === "super123") {
          return { id: "super-1", name: "Süper Yönetici", email: "super@skillbridge.ai", role: "SUPER_ADMIN", companyId: null }
        }
        
        // Mock Company Manager
        if (credentials.email === "admin@skillbridge.ai" && credentials.password === "admin123") {
          return { id: "admin-1", name: "IK Yöneticisi", email: "admin@skillbridge.ai", role: "COMPANY_MANAGER", companyId: "mock-company-1" }
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).companyId = token.companyId;
        (session.user as any).id = token.sub; // Ensure ID is passed too
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "very-secret-key-for-skillbridge",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
