import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all tables for a shop
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    const { shop_slug } = await params;

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
            select: { id: true }
        });

        if (!tenant) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

        // @ts-ignore
        const tables = await prisma.table.findMany({
            where: { tenantId: tenant.id },
            orderBy: { number: "asc" }
        });

        return NextResponse.json(tables);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
    }
}

// POST: Create a new table
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    const { shop_slug } = await params;
    const body = await request.json();

    const session = await getServerSession(authOptions) as any;
    if (!session || (session.user.plan !== 'POS' && shop_slug !== 'demo-shop')) {
        return NextResponse.json({ error: "Forbidden: POS plan required" }, { status: 403 });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: shop_slug },
            select: { id: true }
        });

        if (!tenant) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

        // @ts-ignore
        const table = await prisma.table.create({
            data: {
                number: body.number.toString(),
                capacity: body.capacity || 4,
                status: "vacant",
                tenantId: tenant.id
            }
        });

        return NextResponse.json(table, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
    }
}

// PATCH: Update table status/order
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ shop_slug: string }> }
) {
    const { shop_slug } = await params;
    const body = await request.json(); // { tableId, status }

    const session = await getServerSession(authOptions) as any;
    if (!session || (session.user.plan !== 'POS' && shop_slug !== 'demo-shop')) {
        return NextResponse.json({ error: "Forbidden: POS plan required" }, { status: 403 });
    }

    try {
        // @ts-ignore
        const table = await prisma.table.update({
            where: { id: body.tableId },
            data: {
                status: body.status,
                customer: body.customer,
                currentItems: body.currentItems
            }
        });

        return NextResponse.json(table);
    } catch (err) {
        return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
    }
}
