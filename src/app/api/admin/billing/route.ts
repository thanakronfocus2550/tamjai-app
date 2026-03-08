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

        const [mrrResult, pendingResult, recentTransactions] = await Promise.all([
            // 1. Calculate MRR (Sum of active subscriptions)
            prisma.subscription.aggregate({
                where: { status: "ACTIVE" },
                _sum: { amount: true }
            }),
            // 2. Pending Payments (Sum of PENDING approvals)
            // @ts-ignore
            prisma.paymentApproval ? prisma.paymentApproval.aggregate({
                where: { status: "PENDING" },
                _sum: { amount: true }
            }) : { _sum: { amount: 0 } },
            // 3. Recent Transactions (APPROVED or REJECTED approvals)
            // @ts-ignore
            prisma.paymentApproval ? prisma.paymentApproval.findMany({
                where: {
                    status: { in: ["APPROVED", "REJECTED"] }
                },
                orderBy: { createdAt: "desc" },
                take: 10,
                include: {
                    tenant: {
                        select: { name: true }
                    }
                }
            }) : []
        ]);

        const stats = {
            mrr: mrrResult._sum.amount || 0,
            pending: pendingResult._sum.amount || 0,
            paidStores: await prisma.tenant.count({ where: { plan: "PRO", isActive: true } }),
            transactions: recentTransactions.map((tx: any) => ({
                id: tx.refId,
                store: tx.tenant.name,
                detail: `${tx.plan}`,
                amount: tx.amount,
                date: new Date(tx.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }),
                status: tx.status === 'APPROVED' ? 'Success' : tx.status === 'REJECTED' ? 'Failed' : 'Pending'
            }))
        };

        return NextResponse.json(stats);
    } catch (err) {
        console.error("Fetch billing stats error:", err);
        return NextResponse.json({ error: "Failed to fetch billing data" }, { status: 500 });
    }
}
