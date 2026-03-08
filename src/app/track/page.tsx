"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Store, Clock, CheckCircle2, AlertCircle, ArrowLeft, Copy, Check, ArrowRight } from "lucide-react";

export default function TrackStatusPage() {
    const [refCode, setRefCode] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!refCode.trim()) return;

        setIsSearching(true);
        setResult(null);

        try {
            const res = await fetch(`/api/track/${refCode}`);
            const data = await res.json();

            if (res.ok) {
                setResult(data);
            } else {
                setResult({
                    status: "not_found",
                    message: data.error || "ไม่พบรหัสอ้างอิงนี้ในระบบ กรุณาตรวจสอบอีกครั้ง"
                });
            }
        } catch (err) {
            setResult({
                status: "not_found",
                message: "เกิดข้อผิดพลาดในการเชื่อมต่อระบบ"
            });
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-brand-orange/20 selection:text-brand-orange flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute -left-40 top-20 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl mix-blend-multiply"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[500px] relative z-10"
            >
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 shadow-lg shadow-orange-500/20 text-white font-black text-2xl transition-transform group-hover:scale-105">
                            T
                        </div>
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">เช็คสถานะ & ต่ออายุ</h1>
                    <p className="text-gray-500 font-medium">กรอกรหัสอ้างอิง (REF) หรือ ไอดีร้านค้า เพื่อดูข้อมูล</p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100/50">
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="เช่น REF-9X2K"
                                value={refCode}
                                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                                className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-4 pl-12 pr-32 text-sm font-bold text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none uppercase tracking-widest"
                            />
                            <button
                                type="submit"
                                disabled={isSearching || !refCode.trim()}
                                className="absolute right-2 top-2 bottom-2 rounded-full bg-brand-orange px-6 text-sm font-black text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSearching ? "กำลังหา..." : "เช็คเลย"}
                            </button>
                        </div>
                    </form>

                    <AnimatePresence mode="wait">
                        {result && (
                            <motion.div
                                key={result.status}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="pt-6 border-t border-gray-100"
                            >
                                {result.status === 'not_found' ? (
                                    <div className="text-center py-6">
                                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                            <Search className="h-8 w-8" />
                                        </div>
                                        <p className="font-bold text-gray-900 mb-1">ไม่พบข้อมูลคำขอ</p>
                                        <p className="text-sm font-medium text-gray-500">{result.message}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100/50">
                                            <div className="h-12 w-12 rounded-xl bg-white shadow-sm text-brand-orange flex items-center justify-center shrink-0">
                                                <Store className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-1">
                                                    {result.type === 'registration' ? 'ชื่อร้านค้าที่ขอลงทะเบียน' : 'ข้อมูลร้านค้า'}
                                                </p>
                                                <p className="font-black text-gray-900 text-lg leading-none">{result.storeName}</p>
                                                {result.owner && <p className="text-xs font-bold text-gray-500 mt-1">เจ้าของ: {result.owner}</p>}
                                            </div>
                                        </div>

                                        {result.type === 'registration' ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 text-sm">ส่งคำขอสำเร็จ</p>
                                                        <p className="text-xs font-medium text-gray-500">{result.submittedAt}</p>
                                                    </div>
                                                </div>

                                                <div className="w-0.5 h-6 bg-gray-200 ml-4"></div>

                                                <div className="flex items-start gap-4">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 relative">
                                                        <span className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></span>
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 text-sm mb-1">กำลังตรวจสอบข้อมูล</p>
                                                        <p className="text-xs font-medium text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{result.message}</p>
                                                    </div>
                                                </div>

                                                <div className="w-0.5 h-6 bg-gray-100 ml-4"></div>

                                                <div className={`flex items-center gap-4 ${result.status !== 'approved' ? 'opacity-40 grayscale' : ''}`}>
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${result.status === 'approved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-200 text-gray-400'}`}>
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 text-sm">อนุมัติการเปิดร้าน</p>
                                                        {result.status === 'approved' && <p className="text-xs font-medium text-emerald-600">ยินดีด้วย! ร้านของคุณพร้อมใช้งานแล้ว</p>}
                                                    </div>
                                                </div>

                                                {result.status === 'approved' && result.shopSlug && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="pt-4"
                                                    >
                                                        <Link
                                                            href={`/menu/${result.shopSlug}/admin/login`}
                                                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 text-sm font-black text-white shadow-xl hover:bg-black transition-all hover:-translate-y-0.5"
                                                        >
                                                            เข้าจัดการร้านค้า (Login) <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                        <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                                                            URL ร้านของคุณ: <span className="text-brand-orange">tamjai.pro/menu/{result.shopSlug}</span>
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                                                    <div className="flex items-center gap-2 text-red-600 mb-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <p className="text-xs font-bold uppercase">สถานะปัจจุบัน: หมดอายุ</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">สิ้นสุดเมื่อ {result.expiresAt}</p>
                                                </div>

                                                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-3">ต่ออายุแพ็กเกจ (Pro 450฿)</p>
                                                    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center shrink-0 text-white font-bold text-[10px]">K-BANK</div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900 font-mono">012-3-45678-9</p>
                                                                <p className="text-[10px] font-medium text-gray-500">บจก. ตามใจ โปร</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard("0123456789")}
                                                            className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400 hover:text-brand-orange border border-gray-100 shadow-sm'}`}
                                                        >
                                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <div className="border border-dashed border-brand-orange/40 p-4 rounded-xl text-center bg-orange-50/20 cursor-pointer">
                                                        <p className="text-xs font-bold text-brand-orange">+ อัปโหลดสลิปเพื่อต่ออายุ</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> กลับหน้าหลัก
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
