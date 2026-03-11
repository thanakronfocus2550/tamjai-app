import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
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
        console.error("[PUBLIC_CONFIG_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
