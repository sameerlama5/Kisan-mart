import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import clientPromise from "./mongodb"
const { compare } = require("bcryptjs");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const client = await clientPromise
          const db = client.db()
          const user = await db.collection("users").findOne({ email: credentials.email })

          if (!user) {
            console.log("User not found:", credentials.email)
            return null
          }

          const passwordMatch = await compare(credentials.password, user.password)

          if (!passwordMatch) {
            console.log("Password doesn't match for user:", credentials.email)
            return null
          }

          console.log(
            "Authentication successful for:",
            credentials.email,
            "Role:",
            user.role,
            "Approval:",
            user.approvalStatus,
          )

          // Return user data - let the session callback handle approval status
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            approvalStatus: user.approvalStatus || "approved", // Default to approved for existing users
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.approvalStatus = user.approvalStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.approvalStatus = token.approvalStatus as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// Add this type declaration to ensure TypeScript recognizes the role property
declare module "next-auth" {
  interface User {
    id: string
    role: string
    approvalStatus?: string
  }

  interface Session {
    user: {
      id: string
      role: string
      approvalStatus?: string
      name: string
      email: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    approvalStatus?: string
  }
}
