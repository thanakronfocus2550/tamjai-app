"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-brand-orange/20 selection:text-brand-orange flex items-center justify-center p-6 relative overflow-hidden">
            {/* Abstract Backgrounds */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl mix-blend-multiply -translate-x-1/2"></div>
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl mix-blend-multiply translate-x-1/2"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="text-center mb-10">
                    <Link href="/login" className="inline-flex items-center justify-center p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors mb-6 text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">ลืมรหัสผ่าน?</h1>
                    <p className="text-gray-500 font-medium">กรอกอีเมลที่คุณใช้สมัครเปิดร้าน เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้คุณ</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100/50">
                    {submitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                <Send className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mb-2">ส่งลิงก์สำเร็จ!</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ <span className="font-bold text-gray-700">{email}</span> แล้ว กรุณาตรวจสอบอีเมลของคุณ
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-6 py-4 text-sm font-black text-white hover:bg-black transition-colors"
                            >
                                กลับไปเข้าสู่ระบบ
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">อีเมลที่ใช้สมัคร</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full mt-2 rounded-2xl bg-brand-orange px-6 py-4 text-sm font-black text-white shadow-[0_10px_30px_rgba(255,107,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,107,0,0.4)] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isLoading ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
