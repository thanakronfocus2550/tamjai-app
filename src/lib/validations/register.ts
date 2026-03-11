import { z } from "zod";

export const registerSchema = z.object({
    shopName: z
        .string()
        .min(3, { message: "ชื่อร้านต้องมีความยาวอย่างน้อย 3 ตัวอักษร" })
        .max(50, { message: "ชื่อร้านต้องมีความยาวไม่เกิน 50 ตัวอักษร" }),
    fullName: z.string().min(1, { message: "กรุณากรอกชื่อ-นามสกุล" }),
    nickname: z.string().optional(),
    email: z.string().email({ message: "กรุณากรอกอีเมลที่ถูกต้อง" }),
    phone: z
        .string()
        .regex(/^[0-9]{10}$/, { message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก" }),
    password: z
        .string()
        .min(8, { message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" }),
    subdomain: z.string().min(1, { message: "กรุณาระบุ URL ร้านค้า" }),
    plan: z.enum(["free", "pro", "pos"]),
    couponCode: z.string().optional(),
    slipBase64: z.string().optional(),
    extra_info: z.string().max(0, { message: "Bot detected" }).optional(), // Honeypot
});

export type RegisterInput = z.infer<typeof registerSchema>;
