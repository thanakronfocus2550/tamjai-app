"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            } else {
                // Get session to know the role for redirection
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();

                if (session?.user?.role === 'SUPER_ADMIN') {
                    router.push('/admin');
                } else if (session?.user?.shopSlug) {
                    router.push(`/menu/${session.user.shopSlug}/admin`);
                } else {
                    router.push('/');
                }

                router.refresh();
            }
        } catch (err) {
            setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
        }
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
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 shadow-lg border border-orange-100 transition-transform group-hover:scale-105">
                            <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">เข้าสู่ระบบ</h1>
                    <p className="text-gray-500 font-medium">จัดการร้านอาหารของคุณได้จากทุกที่</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100/50">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                            <p className="text-sm font-bold text-red-600">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">อีเมล</label>
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

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">รหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="h-5 w-5 rounded shadow-sm border border-gray-200 bg-white peer-checked:bg-brand-orange peer-checked:border-brand-orange transition-all"></div>
                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-bold text-gray-600 select-none group-hover:text-gray-900">จดจำฉันไว้</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-bold text-brand-orange hover:text-orange-600 hover:underline">
                                ลืมรหัสผ่าน?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 rounded-2xl bg-brand-orange px-6 py-4 text-sm font-black text-white shadow-[0_10px_30px_rgba(255,107,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,107,0,0.4)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {isLoading ? "กำลังเข้าสู่ระบบ..." : (
                                <>เข้าสู่ระบบ <LogIn className="h-5 w-5 transition-transform group-hover:scale-110" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-sm font-bold text-gray-500">
                            ยังไม่มีบัญชีร้านค้า?
                            <Link href="/register" className="ml-1.5 text-brand-orange hover:underline inline-flex items-center gap-1">
                                สมัครเปิดร้าน <ArrowRight className="h-3 w-3" />
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
