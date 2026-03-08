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
        if (!prisma.promotion) {
            console.error("Prisma client is out of sync: promotion model not found.");
            return NextResponse.json({ error: "Prisma client out of sync. Please run 'npx prisma generate'." }, { status: 500 });
        }

        // @ts-ignore
        const promotions = await prisma.promotion.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(promotions);
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await request.json();
        // Check if prisma is ready for this model
        // @ts-ignore
        if (!prisma.promotion) {
            console.error("Prisma client is out of sync: promotion model not found.");
            return NextResponse.json({ error: "Prisma client out of sync. Please run 'npx prisma generate'." }, { status: 500 });
        }

        // @ts-ignore
        const promotion = await prisma.promotion.create({
            data: {
                code: data.code,
                type: data.type.toUpperCase(),
                value: data.value,
                minPurchase: data.minPurchase || 0,
                usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                status: "ACTIVE"
            }
        });
        return NextResponse.json(promotion);
    } catch (error) {
        console.error("Error creating promotion:", error);
        return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // @ts-ignore
        await prisma.promotion.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete promotion" }, { status: 500 });
    }
}
