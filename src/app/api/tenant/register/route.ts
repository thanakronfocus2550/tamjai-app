import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, shopName, shopSlug, email, password, plan, slipBase64, couponCode } = body;

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
                        plan: plan === 'pro' ? 'PRO' : 'FREE',
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

        // Handle slip upload for PRO plan
        if (plan === 'pro' && slipBase64) {
            try {
                // Ensure the uploads directory exists
                const fs = require('fs');
                const path = require('path');
                const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'slips');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Extract base64 data
                const matches = slipBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const fileExtension = matches[1] === 'image/png' ? 'png' : 'jpg';
                    const buffer = Buffer.from(matches[2], 'base64');
                    const fileName = `slip-${tenant.id}-${Date.now()}.${fileExtension}`;
                    const filePath = path.join(uploadDir, fileName);

                    fs.writeFileSync(filePath, buffer);
                    const fileUrl = `/uploads/slips/${fileName}`;

                    // Create PaymentApproval record
                    const paymentApproval = await (prisma as any).paymentApproval.create({
                        data: {
                            refId: `PAY-${Date.now()}`,
                            tenantId: tenant.id,
                            plan: 'PRO',
                            amount: couponCode === 'TAMJAI100' ? 350 : 450,
                            bank: `โอนเข้าแพลตฟอร์ม`,
                            status: 'PENDING',
                            slipUrl: fileUrl,
                        }
                    });

                    // AI Auto-Verification
                    if (process.env.GEMINI_API_KEY) {
                        try {
                            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                            const prompt = `Analyze this Thai bank transfer slip. Output JSON ONLY: { "amount": number, "date": "DD/MM/YYYY", "time": "HH:mm", "bank": "string", "isSlip": boolean, "confidence": number }`;

                            const imagePart = {
                                inlineData: {
                                    data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
                                    mimeType: fileExtension === 'png' ? 'image/png' : 'image/jpeg'
                                },
                            };

                            const result = await model.generateContent([prompt, imagePart]);
                            const response = await result.response;
                            const text = response.text().trim();
                            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                            const analysis = JSON.parse(jsonStr);

                            // Update the record with AI results
                            await (prisma as any).paymentApproval.update({
                                where: { id: paymentApproval.id },
                                data: { aiAnalysis: analysis }
                            });
                        } catch (aiError) {
                            console.error("AI Auto-verification failed:", aiError);
                        }
                    }
                }
            } catch (fsError) {
                console.error("Error saving slip:", fsError);
            }
        }

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
