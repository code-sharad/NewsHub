import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Ensure the auth route runs on the Node.js runtime on Vercel
export const runtime = "nodejs"
// Prevent static optimization; NextAuth must be dynamic
export const dynamic = "force-dynamic"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }