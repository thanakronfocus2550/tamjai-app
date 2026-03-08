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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction to create both Tenant and User
        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Create Tenant
            const tenant = await tx.tenant.create({
                data: {
                    name: shopName,
                    slug: shopSlug,
                    isActive: true, // Auto-approve for now, can be changed later
                    themeConfig: {
                        primaryColor: "#FF6B00", // Default orange
                    },
                },
            });

            // 2. Create User linked to Tenant
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: "TENANT_ADMIN",
                    tenantId: tenant.id,
                },
            });

            return { tenant, user };
        });

        return NextResponse.json(
            { message: "ลงทะเบียนร้านค้าสำเร็จ", shopSlug: result.tenant.slug },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการลงทะเบียน โปรดลองอีกครั้ง" },
            { status: 500 }
        );
    }
}
