"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquareWarning,
    Send,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    CheckCircle2
} from "lucide-react";

function ContactForm() {
    const searchParams = useSearchParams();
    const shopParam = searchParams.get('shop');
    const topicParam = searchParams.get('topic');

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        topic: topicParam || "general",
        shopName: shopParam || "", // Auto-fills if linking from a specific shop
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsSuccess(true);
            } else {
                alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-brand-orange/20 selection:text-brand-orange">
            {/* Simple Header */}
            <header className="absolute top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-6 md:px-12">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-brand-orange shadow-sm">
                            <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-gray-900">
                            Tamjai<span className="text-brand-orange">Pro</span>
                        </span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> กลับหน้าหลัก
                    </Link>
                </div>
            </header>

            <main className="pt-24 pb-20 px-6 md:px-12 relative">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-b from-orange-100/50 to-transparent blur-3xl -z-10" />

                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 mt-8 lg:mt-16">
                    {/* Left Column: Info */}
                    <div className="flex-1 lg:py-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-xs font-black uppercase tracking-widest mb-6">
                            <MessageSquareWarning className="h-3.5 w-3.5" />
                            Help & Support
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
                            ติดต่อสอบถาม<br />หรือ<span className="text-brand-orange">แจ้งปัญหาการใช้งาน</span>
                        </h1>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed mb-10 max-w-md">
                            พบปัญหาร้านค้าใช้งานไม่ได้ ร้องเรียนบริการ หรือต้องการสอบถามข้อมูลเพิ่มเติม ทีมงาน Tamjai Support พร้อมดูแลคุณ
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-900">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">เบอร์โทรศัพท์</h3>
                                    <a href="tel:+662xxxxxxx" className="text-xl font-black text-gray-900 hover:text-brand-orange transition-colors">02-XXX-XXXX</a>
                                    <p className="text-sm font-medium text-gray-500 mt-0.5">จันทร์ - ศุกร์ (09:00 - 18:00)</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-900">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">อีเมล</h3>
                                    <a href="mailto:support@tamjai.pro" className="text-xl font-black text-gray-900 hover:text-brand-orange transition-colors">support@tamjai.pro</a>
                                    <p className="text-sm font-medium text-gray-500 mt-0.5">ตอบกลับภายใน 24 ชั่วโมง</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="flex-1">
                        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 relative">
                            <AnimatePresence mode="wait">
                                {isSuccess ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center text-center py-12"
                                    >
                                        <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">ส่งข้อความสำเร็จ</h3>
                                        <p className="text-gray-500 font-medium mb-8">
                                            ทีมงานได้รับข้อมูลของคุณเรียบร้อยแล้ว<br />และจะติดต่อกลับโดยเร็วที่สุด
                                        </p>
                                        <button
                                            onClick={() => {
                                                setIsSuccess(false);
                                                setFormData({ ...formData, message: "", shopName: "" }); // Reset some fields
                                            }}
                                            className="px-6 py-3 bg-gray-100 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                                        >
                                            ส่งข้อความใหม่
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-black text-gray-900 mb-2">ส่งข้อความหาเรา</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50"
                                                    placeholder="Ex. สมหมาย ใจดี"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50"
                                                    placeholder="08X-XXX-XXXX"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">อีเมล <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50"
                                                placeholder="your@email.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">หัวข้อที่ต้องการติดต่อ <span className="text-red-500">*</span></label>
                                            <select
                                                name="topic"
                                                required
                                                value={formData.topic}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-black text-gray-900 outline-none transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 appearance-none cursor-pointer"
                                            >
                                                <option value="general">สอบถามข้อมูลทั่วไป</option>
                                                <option value="sales">สนใจเปิดร้าน (ฝ่ายขาย)</option>
                                                <option value="support">แจ้งปัญหาการใช้งานระบบ</option>
                                                <option value="complaint">ร้องเรียนร้านค้า/บริการ</option>
                                                <option value="other">อื่นๆ</option>
                                            </select>
                                        </div>

                                        {(formData.topic === 'complaint' || formData.topic === 'support') && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ชื่อร้านค้า (ที่พบปัญหา)</label>
                                                <input
                                                    type="text"
                                                    name="shopName"
                                                    value={formData.shopName}
                                                    onChange={handleChange}
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50"
                                                    placeholder="ระบุชื่อร้าน (ถ้ามี)"
                                                />
                                            </motion.div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">รายละเอียด <span className="text-red-500">*</span></label>
                                            <textarea
                                                name="message"
                                                required
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={5}
                                                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50"
                                                placeholder="อธิบายสิ่งที่คุณต้องการติดต่อเรา..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-4 text-sm font-black text-white transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-gray-900/20 disabled:opacity-70 disabled:hover:translate-y-0"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    กำลังส่งข้อมูล...
                                                </span>
                                            ) : (
                                                <>ส่งข้อความ <Send className="h-4 w-4" /></>
                                            )}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ContactPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">กำลังโหลด...</div>}>
            <ContactForm />
        </Suspense>
    );
}
