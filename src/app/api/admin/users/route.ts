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

        const users = await prisma.user.findMany({
            where: {
                role: { in: ["SUPER_ADMIN"] } // simplified: only superadmins for now
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(users);
    } catch (err) {
        console.error("Fetch admin users error:", err);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
