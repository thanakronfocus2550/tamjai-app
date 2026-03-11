"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
    Settings,
    ShieldAlert,
    Save,
    BellRing,
    CreditCard,
    Building2,
    Globe2,
    Megaphone,
    AlertCircle,
    Gift,
    Loader2
} from "lucide-react";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SettingsPage() {
    const [platformConfig, setPlatformConfig] = useState({
        platformName: "Tamjai Pro",
        supportEmail: "support@tamjai.pro",
        supportPhone: "02-XXX-XXXX",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Other UI states (Mocks for now)
    const [announcement, setAnnouncement] = useState("ประกาศ: ระบบจะมีการปิดปรับปรุงชั่วคราวในวันที่ 15 ต.ค. นี้ เวลา 02:00 - 04:00 น.");
    const [isAnnounceActive, setIsAnnounceActive] = useState(true);
    const [features, setFeatures] = useState([
        { id: 1, n: "เปิดรับสมัครร้านค้าอัตโนมัติ (Self-registration)", on: true, desc: "อนุญาตให้ร้านค้าใหม่สมัครสมาชิกผ่านหน้า Landing Page ได้ทันที" },
        { id: 2, n: "ระบบเช็คบิลผ่าน QR Code (Auto-checkout)", on: true, desc: "ให้ลูกค้ากดชำระเงินและแนบสลิปผ่านมือถือตัวเอง" },
        { id: 3, n: "Demo Mode (ซ่อนข้อมูลจริง)", on: false, desc: "เปลี่ยนข้อมูลร้านค้าเป็น Mock Data สำหรับการนำเสนอ" },
    ]);
    const [promoConfig, setPromoConfig] = useState({
        enabled: true,
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
        title: "โปรโมชั่นพิเศษ ลด 50%",
        buttonText: "กดรับสิทธิ์เลย",
        buttonLink: "/register",
    });

    useEffect(() => {
        fetchPlatformConfig();
    }, []);

    const fetchPlatformConfig = async () => {
        try {
            const res = await fetch("/api/admin/config/platform");
            if (res.ok) {
                const data = await res.json();
                setPlatformConfig({
                    platformName: data.platformName,
                    supportEmail: data.supportEmail,
                    supportPhone: data.supportPhone,
                });
            }
        } catch (error) {
            console.error("Failed to fetch platform config", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/config/platform", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(platformConfig),
            });
            if (res.ok) {
                alert("บันทึกการตั้งค่าแพลตฟอร์มสำเร็จ! การเปลี่ยนแปลงจะมีผลกับทุกร้านค้าในระบบทันที");
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        } catch (error) {
            console.error("Failed to save platform config", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleFeature = (id: number) => {
        setFeatures(prev => prev.map(f => f.id === id ? { ...f, on: !f.on } : f));
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 pb-12 max-w-4xl"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-black tracking-tight text-gray-900 inline-flex items-center gap-3">
                        <Settings className="h-8 w-8 text-brand-orange" />
                        ตั้งค่าแพลตฟอร์ม
                    </motion.h1>
                    <motion.p variants={itemVariants} className="mt-1 text-sm font-medium text-gray-500">
                        จัดการการทำงานหลัก โดเมน และฟีเจอร์ของระบบ Tamjai Pro
                    </motion.p>
                </div>
                <motion.div variants={itemVariants} className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} บันทึกการตั้งค่า
                    </button>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-8 pt-4">
                {/* System Announcement */}
                <section>
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-brand-orange" /> ประกาศสำคัญของระบบ (System Announcement)
                    </h3>
                    <div className="rounded-[2rem] border border-orange-100 bg-orange-50/30 p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="font-black text-gray-900 text-sm">แสดงป๊อปอัปประกาศสำหรับ Admin ทุกร้านค้า</p>
                                <p className="text-xs text-gray-500 font-medium mt-1">ใช้สำหรับการแจ้งข่าวสาร ปรับปรุงระบบ หรือโปรโมชั่นสำหรับพาร์ทเนอร์</p>
                            </div>
                            <button
                                onClick={() => setIsAnnounceActive(!isAnnounceActive)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAnnounceActive ? 'bg-brand-orange' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnounceActive ? 'translate-x-6 shadow-sm' : 'translate-x-1'}`}></span>
                            </button>
                        </div>

                        <div className="relative">
                            <textarea
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                placeholder="พิมพ์ข้อความประกาศ..."
                                className="w-full h-32 rounded-2xl border border-gray-200 bg-white p-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all resize-none"
                            ></textarea>
                            {isAnnounceActive && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase shadow-sm">
                                    <AlertCircle className="h-3 w-3" /> Live Now
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Promotional Popup */}
                <section>
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-pink-500" /> โปรโมชั่น / แจ้งเตือนลูกค้าผ่าน
                    </h3>
                    <div className="rounded-[2rem] border border-pink-100 bg-pink-50/30 p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-pink-100">
                            <div>
                                <p className="font-black text-gray-900 text-sm">เปิดใช้งาน Popup หน้าแรก (Landing Page)</p>
                                <p className="text-xs text-gray-500 font-medium mt-1">แจ้งโปรโมชั่นให้ผู้ที่เข้าชมเว็บ ลูกค้าจะเห็นเพียง 1 ครั้งใน 24 ชม.</p>
                            </div>
                            <button
                                onClick={() => setPromoConfig({ ...promoConfig, enabled: !promoConfig.enabled })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${promoConfig.enabled ? 'bg-pink-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${promoConfig.enabled ? 'translate-x-6 shadow-sm' : 'translate-x-1'}`}></span>
                            </button>
                        </div>

                        <div className={`space-y-4 transition-opacity ${promoConfig.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">หัวข้อ (Title)</label>
                                    <input
                                        type="text"
                                        value={promoConfig.title}
                                        onChange={e => setPromoConfig({ ...promoConfig, title: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">ลิงก์รูปภาพ (Image URL)</label>
                                    <input
                                        type="text"
                                        value={promoConfig.imageUrl}
                                        onChange={e => setPromoConfig({ ...promoConfig, imageUrl: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-mono focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">ข้อความปุ่ม (Button Text)</label>
                                    <input
                                        type="text"
                                        value={promoConfig.buttonText}
                                        onChange={e => setPromoConfig({ ...promoConfig, buttonText: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">ลิงก์ปลายทาง (Button Link)</label>
                                    <input
                                        type="text"
                                        value={promoConfig.buttonLink}
                                        onChange={e => setPromoConfig({ ...promoConfig, buttonLink: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-mono focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* System Info */}
                <section>
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-400" /> ข้อมูลแพลตฟอร์ม
                    </h3>
                    <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">ชื่อแพลตฟอร์ม</label>
                                <input
                                    type="text"
                                    value={platformConfig.platformName}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, platformName: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">อีเมลติดต่อกลับ (Support)</label>
                                <input
                                    type="email"
                                    value={platformConfig.supportEmail}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">เบอร์โทรศัพท์ติดต่อระบบ</label>
                                <input
                                    type="tel"
                                    value={platformConfig.supportPhone}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, supportPhone: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Routing & Domains */}
                <section>
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Globe2 className="h-5 w-5 text-gray-400" /> การแสดงผลหน้าร้าน (Routing)
                    </h3>
                    <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-brand-orange/30 bg-orange-50/50 cursor-pointer">
                                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-brand-orange bg-white shrink-0">
                                    <div className="h-1.5 w-1.5 rounded-full bg-brand-orange"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Sub-path Routing (Current)</p>
                                    <p className="text-xs text-gray-500 mt-1">ร้านค้าจะเข้าใช้งานผ่าน <code className="bg-white px-1.5 py-0.5 rounded text-orange-600 font-mono">tamjai.pro/store/[slug]</code></p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white cursor-pointer opacity-60">
                                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 bg-white shrink-0"></div>
                                <div>
                                    <p className="font-bold text-gray-900">Sub-domain Routing <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-2">Coming Soon</span></p>
                                    <p className="text-xs text-gray-500 mt-1">ร้านค้าจะเข้าใช้งานผ่าน <code className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-mono">[slug].tamjai.pro</code></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Toggle */}
                <section>
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-gray-400" /> ควบคุมฟีเจอร์หลัก (Feature Flags)
                    </h3>
                    <div className="rounded-[2rem] border border-gray-100 bg-white p-2 shadow-sm divide-y divide-gray-100">
                        {features.map((f, i) => (
                            <div key={f.id} className="flex items-center justify-between p-6">
                                <div>
                                    <p className="font-bold text-gray-900">{f.n}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{f.desc}</p>
                                </div>
                                <button
                                    onClick={() => toggleFeature(f.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${f.on ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${f.on ? 'translate-x-6 shadow-sm' : 'translate-x-1'}`}></span>
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-6 border-t border-gray-200 flex justify-end">
                    <p className="text-xs font-bold text-gray-400">อัปเดตระบบล่าสุดโดย Super Admin เมื่อ 2 ชม. ที่แล้ว</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
