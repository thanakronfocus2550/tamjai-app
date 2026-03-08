"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, LogIn, ShieldCheck } from "lucide-react";

function AdminLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("from") || "/admin";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            } else if (res?.ok) {
                router.push(redirectTo);
                router.refresh();
            }
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการเข้าระบบ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 font-sans flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-orange/20 rounded-full blur-[120px] -z-0" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[400px] relative z-10"
            >
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 shadow-xl shadow-orange-900/30 border border-orange-200/20 transition-transform group-hover:scale-105">
                            <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
                        </div>
                    </Link>
                    <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-4">
                        <ShieldCheck className="h-4 w-4 text-brand-orange" />
                        <span className="text-xs font-black uppercase tracking-widest text-brand-orange">Super Admin</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">เข้าสู่ระบบ</h1>
                    <p className="text-gray-500 font-medium">สำหรับผู้ดูแลระบบ Tamjai Pro เท่านั้น</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1.5">อีเมล</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="email"
                                    placeholder="admin@tamjai.pro"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm font-medium text-white transition-all focus:border-brand-orange focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 outline-none placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1.5">รหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm font-medium text-white transition-all focus:border-brand-orange focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 rounded-2xl bg-brand-orange px-6 py-4 text-sm font-black text-white shadow-[0_10px_30px_rgba(255,107,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,107,0,0.4)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-60"
                        >
                            {loading ? "กำลังเข้าระบบ..." : <><span>เข้าสู่ระบบ Admin</span> <LogIn className="h-5 w-5 transition-transform group-hover:scale-110" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors">
                            ← กลับหน้าหลัก
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">กำลังโหลด...</div>}>
            <AdminLoginForm />
        </Suspense>
    );
}
