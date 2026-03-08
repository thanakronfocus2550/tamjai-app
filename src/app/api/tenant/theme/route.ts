import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { themeColor, logoUrl } = body;

        // Perform validation
        if (!themeColor) {
            return NextResponse.json({ message: "Theme color is required" }, { status: 400 });
        }

        // Validate hex color simple regex
        if (!/^#([0-9A-F]{3}){1,2}$/i.test(themeColor)) {
            return NextResponse.json({ message: "Invalid theme color code" }, { status: 400 });
        }

        const tenant = await prisma.tenant.update({
            where: { id: session.user.tenantId },
            data: {
                themeColor,
                logoUrl: logoUrl || null,
            },
        });

        return NextResponse.json({
            message: "อัปเดตธีมสำเร็จ",
            themeConfig: {
                themeColor: tenant.themeColor,
                logoUrl: tenant.logoUrl,
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Theme update error:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการบันทึกธีม" }, { status: 500 });
    }
}
