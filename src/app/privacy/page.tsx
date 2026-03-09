"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import FloatingMascot from "@/components/FloatingMascot";

export default function PrivacyPolicyPage() {
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
                    <Shield className="h-5 w-5 text-brand-orange" />
                    <span className="font-black text-lg tracking-tight">Tamjai<span className="text-brand-orange">Pro</span></span>
                </div>
                <div className="w-20"></div> {/* Spacer */}
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">เริ่มประกาศความเป็นส่วนตัว<br />(Privacy Policy)</h1>
                    <p className="text-gray-500 font-medium text-lg">ปรับปรุงล่าสุด: วันที่ 9 มีนาคม 2026</p>
                </div>

                <div className="prose prose-lg prose-orange max-w-none text-gray-600 space-y-8">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">1. บทนำ</h2>
                        <p>
                            ระบบ Tamjai Pro ("เรา", "พวกเรา" หรือ "บริการ") ให้ความสำคัญอย่างยิ่งกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน (Personal Data Protection) ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) นโยบายฉบับนี้จัดทำขึ้นเพื่อแจ้งให้ท่านซึ่งเป็น "ผู้ใช้งาน" (ไม่ว่าจะเป็นเจ้าของร้านอาหาร พนักงาน หรือ ลูกค้าที่เข้ามาสั่งอาหาร) ทราบถึงวิธีการที่เราเก็บรวบรวม ใช้ เปิดเผย และปกป้องข้อมูลส่วนบุคคลของท่าน
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">2. ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม</h2>
                        <p>เราอาจเก็บรวบรวมข้อมูลส่วนบุคคลของท่านในรูปแบบต่างๆ ดังต่อไปนี้:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>ข้อมูลเกี่ยวกับการระบุตัวตนของคุณ (Identity Data):</strong> เช่น ชื่อ-นามสกุล, ชื่อเล่น, รููปถ่ายโปรไฟล์ (ในกรณีที่เป็นพนักงานและเจ้าของร้าน)</li>
                            <li><strong>ข้อมูลสำหรับการติดต่อ (Contact Data):</strong> เช่น หมายเลขโทรศัพท์มือถือ, อีเมลแอดเดรส, ข้อมูลบัญชีโซเชียลมีเดีย (เช่น LINE ID หากมีการผูกบัญชีเพื่อรับการแจ้งเตือน)</li>
                            <li><strong>ข้อมูลเกี่ยวกับการสั่งซื้อและการทำธุรกรรม (Transaction Data):</strong> เช่น ประวัติการสั่งอาหาร, รายละเอียดสินค้าที่เลือก, ข้อมูลสลิปโอนเงินเพื่อการตรวจสอบ (สำหรับฝั่งร้านค้า), วันที่และเวลาในการทำธุรกรรม</li>
                            <li><strong>ข้อมูลทางเทคนิค (Technical Data):</strong> เช่น ไอพีแอดเดรส (IP Address), ชนิดและเวอร์ชันของเบราว์เซอร์, รหัสอุปกรณ์, ข้อมูลการใช้งานระบบ (Log file)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">3. วัตถุประสงค์ในการเก็บรวบรวมและใช้งาน</h2>
                        <p>เรานำข้อมูลส่วนบุคคลของท่านไปใช้เพื่อวัตถุประสงค์ต่อไปนี้:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>เพื่อสร้างและดูแลรักษาบัญชีผู้ใช้งานของท่านในระบบ Tamjai Pro</li>
                            <li>เพื่อดำเนินการตามคำสั่งซื้อของท่าน ส่งออเดอร์ให้ร้านอาหาร และตรวจสอบการชำระเงิน</li>
                            <li>เพื่อการดำเนินการวิเคราะห์ข้อมูล ปรับปรุงประสิทธิภาพของแพลตฟอร์มให้ดียิ่งขึ้น</li>
                            <li>เพื่อจัดบรรยากาศให้ AI (Mascot Support) ตอบคำถามหรือช่วยเหลือตรงจุดมากขึ้น</li>
                            <li>เพื่อป้องกันและตรวจสอบการกระทำทุจริต รวมถึงกระบวนการรักษาความปลอดภัย</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">4. การเปิดเผยข้อมูลส่วนบุคคลให้แก่บุคคลที่สาม</h2>
                        <p>
                            ข้อมูลของท่านอาจถูกเปิดเผยแก่ <strong>"ร้านอาหาร (Tenant)"</strong> ที่ท่านได้กระทำการสั่งซื้อสินค้า ทั้งนี้เพื่อให้ร้านอาหารแห่งนั้นสามารถจัดเตรียมออเดอร์ ให้บริการลูกค้าได้อย่างครบถ้วน และรับผิดชอบตามกฎหมาย
                        </p>
                        <p className="mt-4">
                            นอกจากนี้ เราอาจส่งผ่านข้อมูลบางส่วนให้กับ <strong>ผู้ให้บริการภายนอก (Third-party Service Providers)</strong> เช่น ผู้ให้บริการเซิร์ฟเวอร์คลาวด์ แพลตฟอร์มปัญญาประดิษฐ์ (AI) แต่อย่างไรก็ตาม เราจะไม่มีนโยบายการขายข้อมูลส่วนบุคคลของท่านในทุกกรณี
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">5. สิทธิของท่านในฐานะเจ้าของข้อมูลส่วนบุคคล</h2>
                        <p>ตามกฎหมาย PDPA ท่านมีสิทธิดังต่อไปนี้:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>สิทธิขอเข้าถึง (Right to Access):</strong> ท่านสามารถขอเรียกดูและขอรับสำเนาข้อมูลส่วนบุคคลของท่านที่อยู่ในความรับผิดชอบของเรา</li>
                            <li><strong>สิทธิในการแก้ไข (Right to Rectification):</strong> ท่านสามารถขอให้แก้ไขข้อมูลให้ถูกต้องและเป็นปัจจุบันได้เสมอ</li>
                            <li><strong>สิทธิในการลบ (Right to Erasure / Right to be Forgotten):</strong> ท่านสามารถขอร้องเราให้ทำการลบ ระงับ หรือทำลายข้อมูลบัญชีและประวัติที่มีเมื่อไม่มีความจำเป็น</li>
                            <li><strong>สิทธิในการเพิกถอนความยินยอม (Right to Withdraw Consent):</strong> รวมถึงการระงับการแจ้งเตือน </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">6. การติดต่อกับเรา</h2>
                        <p>หากท่านมีคำถามใดๆ เกี่ยวกับนโยบายความเป็นส่วนตัวนี้ หรือประสงค์ที่จะใช้สิทธิใดๆ ของตน สามารถติดต่อได้ที่ฝ่ายบริการลูกค้าผ่าน AI ภายในหน้าระบบ หรือติดต่อเราทาง:</p>
                        <ul className="mt-4 space-y-1 font-bold text-gray-900 border border-gray-100 bg-white p-6 rounded-2xl shadow-sm">
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-orange"></div> อีเมล: admin@tamjai.pro</li>
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-brand-orange"></div> ไลน์: @TamjaiPro</li>
                        </ul>
                    </section>
                </div>
            </main>

            <footer className="border-t border-gray-100 bg-white py-12 text-center text-sm font-bold text-gray-400">
                <p>© 2026 Tamjai SaaS Platform. All rights reserved.</p>
            </footer>
        </div>
    );
}
