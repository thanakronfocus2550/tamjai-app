import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma as any) as any,
    session: {
        strategy: "jwt",
    },
    // pages: {
    //     signIn: "/admin/login",
    // },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                shopSlug: { label: "Shop Slug", type: "text" }, // Optional, mostly for tenant routing
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { tenant: true },
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    tenantId: user.tenantId,
                    shopSlug: user.tenant?.slug || null,
                    plan: user.tenant?.plan || "FREE",
                    trialEndsAt: user.tenant?.trialEndsAt || null,
                    isActive: user.tenant?.isActive ?? true,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.tenantId = user.tenantId;
                token.shopSlug = user.shopSlug;
                token.plan = user.plan;
                token.trialEndsAt = user.trialEndsAt;
                token.isActive = user.isActive;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                (session.user as any).id = token.sub as string;
                (session.user as any).role = token.role as string;
                (session.user as any).tenantId = token.tenantId as string | null;
                (session.user as any).shopSlug = token.shopSlug as string | null;
                (session.user as any).plan = token.plan as string | null;
                (session.user as any).trialEndsAt = token.trialEndsAt;
                (session.user as any).isActive = token.isActive;
            }
            return session;
        },
    },
};
