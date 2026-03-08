import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Check if prisma is ready for this model
        // @ts-ignore
        if (!prisma.paymentApproval) {
            console.error("Prisma client is out of sync: paymentApproval model not found.");
            return NextResponse.json({ error: "Prisma client out of sync. Please run 'npx prisma generate'." }, { status: 500 });
        }

        // @ts-ignore
        const approvals = await prisma.paymentApproval.findMany({
            include: {
                tenant: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(approvals);
    } catch (error) {
        console.error("Error fetching approvals:", error);
        return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, status, reason } = await request.json();

        // @ts-ignore
        const approval = await prisma.paymentApproval.findUnique({
            where: { id },
            include: { tenant: true }
        });

        if (!approval) {
            return NextResponse.json({ error: "Approval not found" }, { status: 404 });
        }

        const updatedApproval = await prisma.$transaction(async (tx) => {
            // @ts-ignore
            const up = await tx.paymentApproval.update({
                where: { id },
                data: {
                    status,
                    reason,
                    processedBy: session.user.name || "Admin",
                    processedAt: new Date()
                }
            });

            if (status === "APPROVED") {
                // Extend subscription or update tenant plan
                // For now, let's assume it's a 1-month PRO extension
                const now = new Date();
                const endDate = new Date(now.setMonth(now.getMonth() + 1));

                await tx.tenant.update({
                    where: { id: approval.tenantId },
                    data: { plan: "PRO" }
                });

                await tx.subscription.create({
                    data: {
                        tenantId: approval.tenantId,
                        amount: approval.amount,
                        startDate: new Date(),
                        endDate: endDate,
                        status: "ACTIVE"
                    }
                });
            }

            return up;
        });

        return NextResponse.json(updatedApproval);
    } catch (error) {
        console.error("Approval error:", error);
        return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
    }
}
