import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenants = await prisma.tenant.findMany({
            include: {
                users: {
                    where: { role: "TENANT_ADMIN" },
                    select: { name: true, email: true, posPin: true }
                },
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const formattedTenants = tenants.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            owner: t.users[0]?.name || "N/A",
            email: t.users[0]?.email || "N/A",
            posPin: t.users[0]?.posPin || "Not Set",
            phone: "-", // simplified
            package: t.plan || "FREE",
            status: t.isActive ? "Active" : "Inactive",
            joined: t.createdAt,
            orders: t._count.orders
        }));

        return NextResponse.json(formattedTenants);
    } catch (err) {
        console.error("Fetch tenants error:", err);
        return NextResponse.json({ error: "Failed to fetch tenants" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, adminName, adminEmail, adminPassword, plan } = body;

        if (!name || !slug || !adminEmail || !adminPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Transaction to create tenant and user
        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    slug,
                    plan: (plan || "FREE").toUpperCase() as any,
                    themeColor: (plan || "").toUpperCase() === "POS" ? "#7C3AED" : "#FF6B00",
                }
            });

            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            const user = await tx.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: "TENANT_ADMIN",
                    tenantId: tenant.id
                }
            });

            return { tenant, user };
        });

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Create tenant error:", err);
        return NextResponse.json({ error: err.message || "Failed to create tenant" }, { status: 500 });
    }
}
