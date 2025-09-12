import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = global as unknown as {
    prisma: ExtendedPrismaClient | undefined
    prismaClient: PrismaClient | undefined
}

function createPrismaClient() {
    return new PrismaClient().$extends(withAccelerate())
}

// Base Prisma client for NextAuth adapter
const prismaClient = globalForPrisma.prismaClient ?? new PrismaClient()

// Extended Prisma client for application use
const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
    globalForPrisma.prismaClient = prismaClient
}

export { prisma, prismaClient }
export type { ExtendedPrismaClient }
