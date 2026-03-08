import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, shopName, shopSlug, email, password } = body;

        // Basic validation
        if (!name || !shopName || !shopSlug || !email || !password) {
            return NextResponse.json(
                { message: "ข้อมูลไม่ครบถ้วน กรุณากรอกให้ครบ" },
                { status: 400 }
            );
        }

        // Check if shop slug already exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { slug: shopSlug },
        });

        if (existingTenant) {
            return NextResponse.json(
                { message: "URL ร้านค้านี้มีคนใช้งานแล้ว กรุณาเปลี่ยนใหม่" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "อีเมลนี้มีผู้ใช้งานแล้ว" },
                { status: 400 }
            );
        }

        // Generate a unique reference code: REF-XXXX (4 random chars)
        const generateRefCode = () => {
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
            let result = "";
            for (let i = 0; i < 4; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return `REF-${result}`;
        };

        const refCode = generateRefCode();

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "TENANT_ADMIN",
                tenant: {
                    create: {
                        name: shopName,
                        slug: shopSlug,
                        refCode, // Save the generated code
                        isActive: false, // Require Superadmin approval for 7-day free trial
                        themeConfig: {
                            primaryColor: "#FF6B00",
                        },
                    } as any
                }
            },
            include: { tenant: true }
        }) as any;

        const tenant = user.tenant!;

        return NextResponse.json(
            {
                message: "ลงทะเบียนสำเร็จ กรุณารอผู้ดูแลระบบอนุมัติเปิดร้าน",
                shopSlug: tenant.slug,
                refCode: tenant.refCode
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("FULL REGISTRATION ERROR:", {
            message: error.message,
            stack: error.stack,
            code: error.code,
            meta: error.meta
        });
        return NextResponse.json(
            {
                message: "เกิดข้อผิดพลาดในการลงทะเบียน โปรดลองอีกครั้ง",
                error: error.message,
                code: error.code,
                meta: error.meta
            },
            { status: 500 }
        );
    }
}
