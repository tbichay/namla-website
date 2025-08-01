import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// For simple admin authentication, we'll use environment variables
// In production, you might want to store admin users in the database
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@namla.de"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export const authOptions: NextAuthOptions = {
  // Don't use adapter for credentials-based auth
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Simple admin authentication
        // In production, you might want to hash the admin password and store it securely
        if (
          credentials.email === ADMIN_EMAIL && 
          credentials.password === ADMIN_PASSWORD
        ) {
          return {
            id: "admin",
            email: ADMIN_EMAIL,
            name: "Admin",
            role: "admin"
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/admin/login"
  },
  secret: process.env.NEXTAUTH_SECRET
}

// Middleware helper to check if user is admin
export const isAdmin = (session: any) => {
  return session?.user?.role === "admin"
}