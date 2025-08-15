import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        session: async ({ session, user }) => {
            if (session?.user && user) {
                session.user.id = user.id
            }
            return session
        },
        jwt: async ({ user, token }) => {
            if (user) {
                token.uid = user.id
            }
            return token
        },
        signIn: async ({ user, account, profile }) => {
            // Allow sign in
            return true
        },
        redirect: async ({ url, baseUrl }) => {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
    },
    session: {
        strategy: "database",
    },
    pages: {
        error: "/auth/error", // Error code passed in query string as ?error=
    },
    debug: process.env.NODE_ENV === "development",
}