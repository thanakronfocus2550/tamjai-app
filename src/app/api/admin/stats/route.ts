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

        const [tenantCount, proTenantCount, totalRevenue, userCount, promoStats, pendingTickets, pendingApprovals] = await Promise.all([
            prisma.tenant.count(),
            prisma.tenant.count({ where: { plan: "PRO" } }),
            prisma.order.aggregate({
                _sum: { totalAmount: true }
            }),
            prisma.user.count(),
            // @ts-ignore
            prisma.promotion ? prisma.promotion.aggregate({
                _sum: { usageCount: true },
                _count: { id: true }
            }) : { _sum: { usageCount: 0 }, _count: { id: 0 } },
            // @ts-ignore
            prisma.mascotTicket ? prisma.mascotTicket.findMany({
                where: { status: "PENDING" },
                take: 3,
                orderBy: { createdAt: "desc" }
            }) : [],
            // @ts-ignore
            prisma.paymentApproval ? prisma.paymentApproval.count({
                where: { status: "PENDING" }
            }) : 0
        ]);

        // Get recent tenants
        const tenants = await prisma.tenant.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { orders: true }
                },
                orders: {
                    select: { totalAmount: true }
                }
            }
        });

        // Get Top Sellers
        const topSellers = await prisma.tenant.findMany({
            take: 5,
            orderBy: {
                orders: {
                    _count: 'desc'
                }
            },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });

        // Format data for the dashboard
        const stats = {
            revenue: Number(totalRevenue._sum.totalAmount || 0),
            tenants: tenantCount,
            proTenants: proTenantCount,
            users: userCount,
            promoCodes: promoStats._count.id || 0,
            promoUsage: promoStats._sum.usageCount || 0,
            notifications: {
                paymentApprovals: pendingApprovals,
                urgentSupport: pendingTickets.map((t: any) => ({
                    id: t.id,
                    name: t.shopSlug === 'general' ? 'General' : t.shopSlug,
                    msg: t.subject,
                    time: "Now"
                }))
            },
            topSellers: topSellers.map(s => ({
                id: s.id,
                name: s.name,
                orders: s._count.orders
            })),
            recentTenants: tenants.map(t => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                package: t.plan || "FREE",
                orders: t._count.orders,
                revenue: t.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
                status: t.isActive ? "Active" : "Inactive",
                createdAt: t.createdAt
            }))
        };

        return NextResponse.json(stats);
    } catch (err) {
        console.error("Fetch admin stats error:", err);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
