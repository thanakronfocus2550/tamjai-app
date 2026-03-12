import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            tenantId: string | null
            shopSlug: string | null
            plan: string | null
            trialEndsAt: Date | string | null
            isActive: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: string
        tenantId: string | null
        shopSlug?: string | null
        plan?: string | null
        trialEndsAt?: Date | string | null
        isActive?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        tenantId: string | null
        shopSlug?: string | null
        plan?: string | null
        trialEndsAt?: Date | string | null
        isActive?: boolean
    }
}
