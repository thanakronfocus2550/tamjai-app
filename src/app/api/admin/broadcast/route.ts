import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, content, type, expiresAt, isGlobal, targetTenants } = body;

        const broadcast = await prisma.broadcastMessage.create({
            data: {
                title,
                content,
                type: type || "INFO",
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isGlobal: isGlobal ?? true,
                targetTenants: targetTenants || [],
                author: session.user.name || "System Admin",
            },
        });

        return NextResponse.json(broadcast);
    } catch (error) {
        console.error("[BROADCAST_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const broadcasts = await prisma.broadcastMessage.findMany({
            where: {
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(broadcasts);
    } catch (error) {
        console.error("[BROADCAST_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
