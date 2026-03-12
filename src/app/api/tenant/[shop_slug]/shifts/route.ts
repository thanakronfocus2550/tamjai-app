import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    const { shop_slug } = await params;
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (session.user.plan !== 'POS') {
            return NextResponse.json({ message: "Forbidden: POS plan required" }, { status: 403 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
        });

        if (!tenant) {
            return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
        }

        // @ts-ignore
        const currentShift = await prisma.shift.findFirst({
            where: {
                tenantId: tenant.id,
                status: "OPEN",
            },
            orderBy: {
                openedAt: "desc",
            },
        });

        return NextResponse.json(currentShift);
    } catch (error) {
        console.error("Error fetching current shift:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    const { shop_slug } = await params;
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (session.user.plan !== 'POS') {
            return NextResponse.json({ message: "Forbidden: POS plan required" }, { status: 403 });
        }

        const body = await req.json();
        const { action, cashIn, cashOut, actualCash, notes } = body;

        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
        });

        if (!tenant) {
            return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
        }

        if (action === "OPEN") {
            // Check if there's already an open shift
            // @ts-ignore
            const openShift = await prisma.shift.findFirst({
                where: {
                    tenantId: tenant.id,
                    status: "OPEN",
                },
            });

            if (openShift) {
                return NextResponse.json({ message: "A shift is already open" }, { status: 400 });
            }

            // @ts-ignore
            const newShift = await prisma.shift.create({
                data: {
                    tenantId: tenant.id,
                    staffId: session.user.id,
                    cashIn: cashIn || 0,
                    status: "OPEN",
                    notes,
                },
            });

            return NextResponse.json(newShift);
        } else if (action === "CLOSE") {
            // @ts-ignore
            const openShift = await prisma.shift.findFirst({
                where: {
                    tenantId: tenant.id,
                    status: "OPEN",
                },
            });

            if (!openShift) {
                return NextResponse.json({ message: "No open shift found" }, { status: 400 });
            }

            // Calculate expected cash (simplified: starting cash + total of completed orders since openedAt)
            const orders = await prisma.order.findMany({
                where: {
                    tenantId: tenant.id,
                    status: "completed",
                    createdAt: {
                        gte: openShift.openedAt,
                    },
                },
            });

            const totalSales = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
            const expectedCash = Number(openShift.cashIn) + totalSales;

            // @ts-ignore
            const updatedShift = await prisma.shift.update({
                where: { id: openShift.id },
                data: {
                    closedAt: new Date(),
                    cashOut: totalSales,
                    actualCash: actualCash,
                    difference: actualCash ? actualCash - expectedCash : 0,
                    status: "CLOSED",
                    notes,
                },
            });

            return NextResponse.json({ ...updatedShift, expectedCash });
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("Error managing shift:", error);
        const { shop_slug } = await params;
        return NextResponse.json({
            message: "Internal Server Error",
            error: error.message,
            debug: { shop_slug, params: await params },
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
