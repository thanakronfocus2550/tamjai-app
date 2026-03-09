import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { shopSlug, lineUserId } = await req.json();

        if (!shopSlug || !lineUserId) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // @ts-ignore
        const tenant = await prisma.tenant.update({
            where: { slug: shopSlug },
            // @ts-ignore
            data: { lineUserId }
        });

        return NextResponse.json({ success: true, tenant });
    } catch (error: any) {
        console.error("LINE Connection Error:", error);
        return NextResponse.json({ error: "Failed to connect LINE" }, { status: 500 });
    }
}
