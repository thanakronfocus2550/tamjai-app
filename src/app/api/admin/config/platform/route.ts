import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let config = await prisma.platformConfig.findUnique({
            where: { id: 1 }
        });

        if (!config) {
            config = await prisma.platformConfig.create({
                data: { id: 1 }
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error("[PLATFORM_CONFIG_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { platformName, supportEmail, supportPhone } = body;

        const config = await prisma.platformConfig.upsert({
            where: { id: 1 },
            update: {
                platformName,
                supportEmail,
                supportPhone,
            },
            create: {
                id: 1,
                platformName,
                supportEmail,
                supportPhone,
            },
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error("[PLATFORM_CONFIG_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
