"use client";

import React, { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Monitor,
    Smartphone,
    Zap,
    ShieldCheck,
    ArrowRight,
    LayoutDashboard,
    ExternalLink,
    ChevronLeft,
    Store,
    QrCode
} from "lucide-react";

export default function POSDemoLanding({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = use(params);
    const storeName = shop_slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    return (
        <div className="min-h-screen bg-[#0F1115] text-white font-sans selection:bg-orange-500/30 selection:text-orange-500 overflow-hidden relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <header className="px-6 py-6 border-b border-white/5 backdrop-blur-md bg-black/20 sticky top-0">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                                <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">Tamjai<span className="text-orange-500">Pro</span></span>
                        </Link>
                        <div className="hidden sm:flex items-center gap-6">
                            <Link href="/register" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">รับสิทธิ์เปิดร้านจริง</Link>
                            <Link href="/login" className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">เข้าสู่ระบบ</Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-black uppercase tracking-[0.2em] mb-8 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                            <Zap className="h-3 w-3 fill-current" /> Experience the demo
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-8">
                            ระบบรันเนอร์<br />
                            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-purple-500 bg-clip-text text-transparent">ที่เร็วที่สุด</span> ของคุณ
                        </h1>

                        <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                            เปลี่ยนทุกจอให้เป็นเครื่อง POS มือโปร จัดการออเดอร์ ผังโต๊ะ และเช็คบิลได้ไวกว่าเดิม 3 เท่า พร้อมรับ Demo Mode ของร้าน <span className="text-white font-black">{storeName}</span>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={`/menu/${shop_slug}/admin/pos`}
                                className="group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-orange-500 px-10 py-5 text-lg font-black text-white shadow-2xl shadow-orange-500/40 hover:bg-orange-600 active:scale-95 transition-all overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <Monitor className="h-6 w-6" />
                                เข้าสู่ระบบ POS DEMO
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link
                                href={`/menu/${shop_slug}`}
                                target="_blank"
                                className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-10 py-5 text-lg font-black hover:bg-white/10 transition-all active:scale-95"
                            >
                                <ExternalLink className="h-5 w-5" />
                                ดูหน้าร้านออนไลน์
                            </Link>
                        </div>

                        {/* Interactive Hardware Teaser */}
                        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                            {[
                                {
                                    icon: Smartphone,
                                    title: "รองรับทุกอุปกรณ์",
                                    desc: "ใช้ได้ทั้ง iPad, Android Tablet หรือมือถือรุ่นไหนก็ได้",
                                    color: "blue"
                                },
                                {
                                    icon: QrCode,
                                    title: "ผังโต๊ะ Interactive",
                                    desc: "ลากโต๊ะ รวมบิล แยกบิล จัดการพื้นที่ได้แบบ Real-time",
                                    color: "orange"
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "คุมยอดเงินสดแม่นยำ",
                                    desc: "ระบบเปิด-ปิดกะ คุมเงินทอนและยอดขายรายคนแบบโปร",
                                    color: "purple"
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                                >
                                    <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <item.icon className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </main>

                <footer className="p-8 border-t border-white/5 text-center">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                        powered by Tamjai Pro POS Engine v2.0
                    </p>
                </footer>
            </div>
        </div>
    );
}
