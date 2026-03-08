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

        // Get revenue grouped by month for the last 7 months
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
        sevenMonthsAgo.setDate(1);
        sevenMonthsAgo.setHours(0, 0, 0, 0);

        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: sevenMonthsAgo },
                status: "completed"
            },
            select: {
                totalAmount: true,
                createdAt: true
            }
        });

        // Group by month
        const monthlyData: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('en-US', { month: 'short' });
            monthlyData[key] = 0;
        }

        orders.forEach(order => {
            const month = new Date(order.createdAt).toLocaleString('en-US', { month: 'short' });
            if (monthlyData[month] !== undefined) {
                monthlyData[month] += Number(order.totalAmount);
            }
        });

        const chartData = Object.entries(monthlyData)
            .map(([month, amount]) => ({ month, amount }))
            .reverse();

        return NextResponse.json(chartData);
    } catch (err) {
        console.error("Fetch revenue trends error:", err);
        return NextResponse.json({ error: "Failed to fetch revenue trends" }, { status: 500 });
    }
}
