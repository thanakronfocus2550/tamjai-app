import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const next7Days = new Date();
        next7Days.setDate(now.getDate() + 7);

        const [tenants, activeCount, expiringCount, mrrResult] = await Promise.all([
            prisma.tenant.findMany({
                include: {
                    users: {
                        where: { role: "TENANT_ADMIN" },
                        select: { name: true }
                    },
                    subscriptions: {
                        orderBy: { endDate: 'desc' },
                        take: 1
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.tenant.count({ where: { isActive: true } }),
            prisma.subscription.count({
                where: {
                    status: "ACTIVE",
                    endDate: {
                        gte: now,
                        lte: next7Days
                    }
                }
            }),
            prisma.subscription.aggregate({
                where: { status: "ACTIVE" },
                _sum: { amount: true }
            })
        ]);

        const formattedSubscriptions = tenants.map(t => {
            const sub = t.subscriptions[0];
            const daysLeft = sub ? Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

            let status = t.isActive ? "Active" : "Inactive";
            if (sub && daysLeft <= 0) status = "Expired";
            else if (sub && daysLeft <= 7) status = "Expiring Soon";

            return {
                id: sub?.id || `SUB-${t.id.slice(0, 4).toUpperCase()}`,
                store: t.name,
                owner: t.users[0]?.name || "N/A",
                plan: t.plan || "FREE",
                price: Number(sub?.amount || 0),
                status: status,
                expires: sub ? new Date(sub.endDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A",
                daysLeft: daysLeft
            };
        });

        return NextResponse.json({
            subscriptions: formattedSubscriptions,
            stats: {
                activeShops: activeCount,
                expiringShops: expiringCount,
                mrr: mrrResult._sum.amount || 0
            }
        });
    } catch (err) {
        console.error("Fetch subscriptions error:", err);
        return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
    }
}
