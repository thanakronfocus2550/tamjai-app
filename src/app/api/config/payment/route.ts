import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const configTenant = await prisma.tenant.findUnique({ where: { slug: '__system_config__' } });
        const config = (configTenant?.themeConfig as any) || {
            bankName: "ธนาคารกสิกรไทย",
            accountNo: "012-3-45678-9",
            accountName: "บจก. ตามใจ โปร"
        };
        return NextResponse.json(config);
    } catch (err) {
        return NextResponse.json({ bankName: "ธนาคารกสิกรไทย", accountNo: "012-3-45678-9", accountName: "บจก. ตามใจ โปร" });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        await prisma.tenant.upsert({
            where: { slug: '__system_config__' },
            update: { themeConfig: body },
            create: {
                name: "System Config",
                slug: "__system_config__",
                isActive: false,
                themeConfig: body
            }
        });

        return NextResponse.json({ success: true, config: body });
    } catch (err) {
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
