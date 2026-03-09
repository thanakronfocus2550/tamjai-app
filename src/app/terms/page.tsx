"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import FloatingMascot from "@/components/FloatingMascot";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-brand-orange/20 selection:text-brand-orange">
            <FloatingMascot shopSlug="superadmin" />

            {/* Simple Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-bold text-sm">กลับหน้าหลัก</span>
                </Link>
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-brand-orange" />
                    <span className="font-black text-lg tracking-tight">Tamjai<span className="text-brand-orange">Pro</span></span>
                </div>
                <div className="w-20"></div> {/* Spacer */}
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">ข้อกำหนดและเงื่อนไขการใช้บริการ<br />(Terms of Service)</h1>
                    <p className="text-gray-500 font-medium text-lg">ปรับปรุงล่าสุด: วันที่ 9 มีนาคม 2026</p>
                </div>

                <div className="prose prose-lg prose-orange max-w-none text-gray-600 space-y-8">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">1. บทนำและข้อตกลงในการใช้งาน</h2>
                        <p>
                            ยินดีต้อนรับสู่ Tamjai Pro (ต่อไปนี้จะเรียกว่า "เรา", "พวกเรา" หรือ "บริการ") ในการเข้าสู่เว็บไซต์และใช้งานระบบบนแพลตฟอร์ม ทั้งในฐานะ <strong>"พาร์ทเนอร์ร้านอาหาร (Tenant)"</strong> และ <strong>"ลูกค้าที่เข้ามายังร้านค้า (Customer)"</strong> ท่านตกลงรับทราบและยินยอมผูกพันตนตามข้อตกลงและเงื่อนไขของนโยบายฉบับนี้
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">2. คำจำกัดความเบื้องต้น</h2>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>"ผู้ใช้บริการ (User/Customer)":</strong> หมายถึง ลูกค้าที่มีเจตนาในการเข้าขมหน้าร้าน ทำการสั่งอาหาร หรือการชำระเงิน</li>
                            <li><strong>"ร้านค้า (Tenant/Shop)":</strong> หมายถึง เจ้าของธุรกิจหรือนิติบุคคลที่ได้สมัครอนุญาตใช้บริการแพลตฟอร์ม Tamjai Pro เพื่อรับออเดอร์และการจัดการสินค้า</li>
                            <li><strong>"แพลตฟอร์ม (Platform)":</strong> ระบบบริการสั่งอาหาร ซอฟต์แวร์ อัลกอริทึม รูปภาพ โลโก้ และเนื้อหาทั้งหมดที่อยู่บน domain *.tamjai.pro</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">3. หน้าที่ความรับผิดชอบของร้านอาหาร (Tenant Duties)</h2>
                        <p>เพื่อเป็นการรักษามาตรฐานในการให้บริการ ร้านค้าจะต้องปฏิบัติดังนี้:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>ความถูกต้องของข้อมูล:</strong> ร้านค้าจะต้องเป็นผู้สร้างรายการอาหาร เสนอราคา ทำโปรโมชั่น และจัดส่งสินค้า รวมถึงแสดงรายละเอียดส่วนผสม/ข้อมูลสารก่อภูมิแพ้อย่างถูกต้องให้ลูกค้าทราบตามกฎหมาย </li>
                            <li><strong>การชำระเงิน:</strong> ร้านค้ารับทราบว่าแพลตฟอร์มนี้เป็นเพียงตัวกลางในการส่งคำสั่งซื้อและรับหลักฐานการโอน ร้านค้าจะไม่ทำการทุจริตหลอกลวงหรือฉ้อโกง </li>
                            <li><strong>กฎห้ามเผยแพร่:</strong> ห้ามมิให้ร้านค้าทำการแอบอ้างสิทธิ์ของบุคคลที่สาม หรือฝ่าฝืนจารีตประเพณีที่ดีงาม เช่น การขายแอลกอฮอล์ บุหรี่ และยาเสพติด ยกเว้นมีใบอนุญาต</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">4. หน้าที่ความรับผิดชอบของผู้ติดต่อ/สั่งอาหาร (Customer Duties)</h2>
                        <p>
                            ผู้สั่งอาหารต้องตกลงว่าจะยืนยันคำสั่งซื้อตามความประสงค์จริง โปรดตรวจสอบรายการเมนู ราคา รูปแบบ และระยะเวลาก่อนตัดสินใจโอนเงินให้ร้านค้า
                            เนื่องจาก Tamjai Pro ไม่สามารถรับผิดชอบในความสูญเสียจากธุรกรรมที่ดำเนินการไม่สำเร็จ หรือความเสียหายจากการทานอาหารที่ไม่ได้มารตฐานของร้านค้านั้นๆ ได้
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">5. ทรัพย์สินทางปัญญา (Intellectual Property)</h2>
                        <p>
                            รูปภาพ องค์ประกอบ กราฟิก และซอฟต์แวร์ หรือโค้ดใดๆ ที่อยู่ใน Tamjai Pro เป็นลิขสิทธิ์ของเรา ห้ามมิให้ผู้ใดคัดลอก และทำการวิศวกรรมย้อนกลับ (Reverse Engineering) เว้นแต่รูปภาพอาหาร/โลโก้ของร้านค้าที่อัปโหลดเอง ซึ่งร้านค้าจะต้องเป็นผู้รับผิดชอบถึงสิทธิ์หรือได้รับอนุญาตให้ใช้ลิขสิทธิ์รูปภาพเหล่านั้นเอง
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">6. การระงับสิทธิการใช้งานแพลตฟอร์ม</h2>
                        <p>
                            เราขอสงวนสิทธิ์ในการบล็อคบัญชีร้านค้า หรือลบร้านค้า (Shop) บนแพลตฟอร์มได้ทันทีโดยไม่ต้องแจ้งให้ทราบล่วงหน้า หากบริษัทพิจารณาพบการละเมิดข้อตกลง การฉ้อโกง การกระทำผิดทางกฎหมาย เพื่อป้องกันความเสียหายที่อาจเกิดขึ้นแก่ประชาชนทั่วไป
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t border-gray-100 bg-white py-12 text-center text-sm font-bold text-gray-400">
                <p>© 2026 Tamjai SaaS Platform. All rights reserved.</p>
            </footer>
        </div>
    );
}
