"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";
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
                    <FileText className="h-5 w-5 text-brand-orange" />
                    <span className="font-black text-lg tracking-tight">Tamjai<span className="text-brand-orange">Pro</span></span>
                </div>
                <div className="w-20"></div> {/* Spacer */}
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-sm font-bold mb-6">
                        <AlertTriangle className="h-4 w-4" /> Beta Version
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6 font-primary">ข้อกำหนดและเงื่อนไขการใช้บริการ<br />(Terms of Service)</h1>
                    <p className="text-gray-500 font-medium text-lg">ปรับปรุงล่าสุด: วันที่ 11 มีนาคม 2026</p>
                </div>

                <div className="prose prose-lg prose-orange max-w-none text-gray-600 space-y-10">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8 italic">1. บทนำ</h2>
                        <p>
                            ยินดีต้อนรับสู่ Tamjai Pro (ต่อไปนี้จะเรียกว่า "เรา", "พวกเรา" หรือ "บริการ") ในการเข้าใช้งานแพลตฟอร์มนี้ ท่านตกลงรับทราบและยินยอมผูกพันตามข้อกำหนดและเงื่อนไขที่ระบุไว้ในนโยบายฉบับนี้ หากท่านไม่เห็นด้วยกับข้อกำหนดเหล่านี้ โปรดระงับการใช้งานบริการ
                        </p>
                    </section>

                    <section className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100">
                        <h2 className="text-2xl font-black text-amber-900 mb-4">2. สถานะของบริการ (Beta Version)</h2>
                        <p className="text-amber-800 font-medium">
                            ผู้ใช้บริการรับทราบและตกลงว่า Tamjai Pro เป็นแพลตฟอร์มที่อยู่ในระหว่างการพัฒนา (Beta Version) เพื่อจุดประสงค์ในการทดสอบและปรับปรุงระบบ ผู้พัฒนาขอสงวนสิทธิ์ในการแก้ไข ปรับปรุง หรือหยุดให้บริการบางส่วนหรือทั้งหมดได้ทุกเมื่อโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 mt-8">3. การปฏิเสธความรับผิดชอบ (Disclaimer)</h2>
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute left-0 top-0 w-1.5 h-full bg-brand-orange"></div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">ความถูกต้องของข้อมูล</h3>
                                <p className="text-sm">ระบบปัญญาประดิษฐ์ (AI Mascot) และระบบตรวจสอบสลิปอัตโนมัติ เป็นเพียงเครื่องมือช่วยอำนวยความสะดวกเท่านั้น ผู้พัฒนาไม่รับประกันความถูกต้องแม่นยำ 100% ผู้ใช้มีหน้าที่ตรวจสอบข้อมูลด้วยตนเองอีกครั้งก่อนดำเนินการใดๆ</p>
                            </div>

                            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 w-1.5 h-full bg-red-500"></div>
                                <h3 className="text-lg font-bold text-red-900 mb-2">ความเสียหายทางธุรกิจ</h3>
                                <p className="text-sm text-red-800 font-bold">"ผู้พัฒนา (ธนกร ชูวงศ์วาลย์) จะไม่รับผิดชอบต่อความสูญเสีย ความเสียหาย หรือผลกระทบใดๆ (รวมถึงแต่ไม่จำกัดเพียง การขาดทุนจากการทำธุรกิจ ข้อมูลสูญหาย หรือระบบขัดข้อง) ที่เกิดขึ้นจากการใช้งานแพลตฟอร์มนี้ไม่ว่ากรณีใดก็ตาม"</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute left-0 top-0 w-1.5 h-full bg-gray-400"></div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">ธุรกรรมระหว่างบุคคล</h3>
                                <p className="text-sm">เราเป็นเพียงผู้ให้บริการระบบจัดการ ธุรกรรมการเงินและการจัดส่งอาหารเป็นความรับผิดชอบโดยตรงระหว่างร้านค้าและลูกค้า</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">4. หน้าที่ความรับผิดชอบของผู้ใช้</h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li>ท่านตกลงที่จะไม่ใช้งานระบบในทางที่ผิดกฎหมาย หรือส่งข้อมูลที่เป็นเท็จ</li>
                            <li>ห้ามกระทำการใดๆ ที่เป็นการโจมตีระบบ (Cyber Attack), ส่งข้อมูลขยะ (Spam) หรือพยายามเข้าถึงข้อมูลของผู้อื่นโดยไม่ได้รับอนุญาต</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">5. ทรัพย์สินทางปัญญา</h2>
                        <p>
                            องค์ประกอบ รูปแบบ ซอฟต์แวร์ และซอร์สโค้ดของ Tamjai Pro เป็นลิขสิทธิ์ของผู้พัฒนา ห้ามมิให้ผู้ใดคัดลอก ดัดแปลง หรือทำวิศวกรรมย้อนกลับ (Reverse Engineering) โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">6. การสิ้นสุดการให้บริการ</h2>
                        <p>
                            เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้งานทันที หากพบการละเมิดข้อตกลง การทุจริต หรือการกระทำที่ส่งผลเสียต่อความมั่นคงของระบบ
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 mt-8">7. การติดต่อ</h2>
                        <p>
                            หากท่านมีข้อสงสัยเกี่ยวกับข้อกำหนดนี้ สามารถติดต่อผู้พัฒนาได้ที่ช่องทางติดต่อภายในแอปพลิเคชัน Tamjai Pro
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
