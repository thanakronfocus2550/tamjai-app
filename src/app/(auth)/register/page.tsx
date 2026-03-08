"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Store, User, Mail, Phone, Globe, CheckCircle2, ChevronRight, Lock, AlertCircle, XCircle } from "lucide-react";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        storeName: "",
        fullName: "",
        nickname: "",
        email: "",
        phone: "",
        password: "",
        subdomain: "",
        plan: "free",
    });

    // Platform settings (usually fetched from an API)
    const isFreeTrialActive = true;
    const freeStoresCount = 1;
    const MAX_FREE_STORES = 10;
    const isQuotaFull = freeStoresCount >= MAX_FREE_STORES;
    const canRegisterFree = isFreeTrialActive && !isQuotaFull;

    // Default to 'pro' if free is not available
    useState(() => {
        if (!canRegisterFree) {
            setFormData(prev => ({ ...prev, plan: 'pro' }));
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [slipFileName, setSlipFileName] = useState("");

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSlipFileName(e.target.files[0].name);
        }
    };

    const updateForm = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
    };

    const submitForm = async () => {
        setIsSubmitting(true);
        setSubmitError("");

        try {
            const res = await fetch("/api/tenant/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.fullName,
                    shopName: formData.storeName,
                    shopSlug: formData.subdomain,
                    email: formData.email,
                    password: formData.password,
                    // Note: nickname, phone, and plan could also be sent and saved if added to the model
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // Success! Move to "Pending Approval" or "Success" state
            setStep(4);
        } catch (err: any) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-brand-orange/20 selection:text-brand-orange flex">
            {/* Left Column: Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                    <motion.div
                        className="h-full bg-brand-orange"
                        initial={{ width: "33%" }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>

                <div className="w-full max-w-md mx-auto relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-orange-50 shadow-lg border border-orange-100 transition-transform group-hover:scale-105">
                            <img src="/admin-logo.png" alt="Tamjai Pro" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-gray-900">Tamjai<span className="text-brand-orange">Pro</span></span>
                    </Link>

                    {/* Stepper Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
                            {step === 1 && "เริ่มต้นสร้างร้านของคุณ"}
                            {step === 2 && "ตั้งชื่อ URL ร้านค้า"}
                            {step === 3 && "เลือกแพ็กเกจ & ยืนยัน"}
                            {step === 4 && "ส่งคำขอเปิดร้านสำเร็จ!"}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {step === 1 && "กรอกข้อมูลพื้นฐานเพื่อสร้างหน้าร้านออนไลน์ของคุณ"}
                            {step === 2 && "ตั้งชื่อลิ้งค์ที่ลูกค้าจะใช้เข้ามาสั่งอาหาร (เปลี่ยนได้ภายหลัง)"}
                            {step === 3 && "เริ่มทดลองใช้ฟรี 7 วัน หรือเลือกสมัครแพ็กเกจ Pro ทันที"}
                            {step === 4 && (formData.plan === 'free' ? "รอสักครู่ ระบบกำลังเตรียมหน้าร้านให้คุณ โดยไม่ต้องตรวจสอบสลิปยืนยัน" : "กรุณารอผู้ดูแลระบบตรวจสอบข้อมูลและสลิปการโอนเงิน")}
                        </p>
                    </div>

                    {/* Form Steps */}
                    <div className="relative min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5"
                                >
                                    <div className="space-y-4">
                                        {/* Store Name & Owner Details */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อร้าน (Store Name) <span className="text-brand-orange">*</span></label>
                                            <div className="relative">
                                                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="เช่น ส้มตำแซ่บเวอร์ สาขาเอกมัย"
                                                    value={formData.storeName}
                                                    onChange={(e) => updateForm("storeName", e.target.value)}
                                                    className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อจริง-สกุล <span className="text-brand-orange">*</span></label>
                                                <div className="relative">
                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="สมชาย ใจดี"
                                                        value={formData.fullName}
                                                        onChange={(e) => updateForm("fullName", e.target.value)}
                                                        className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อเล่น</label>
                                                <input
                                                    type="text"
                                                    placeholder="ชาย"
                                                    value={formData.nickname}
                                                    onChange={(e) => updateForm("nickname", e.target.value)}
                                                    className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3 px-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">เบอร์โทรศัพท์ <span className="text-brand-orange">*</span></label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        placeholder="08X-XXX-XXXX"
                                                        value={formData.phone}
                                                        onChange={(e) => updateForm("phone", e.target.value)}
                                                        className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100 my-2" />

                                        {/* Login Credentials */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">อีเมล (สำหรับเข้าสู่ระบบ) <span className="text-brand-orange">*</span></label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => updateForm("email", e.target.value)}
                                                    className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">รหัสผ่าน <span className="text-brand-orange">*</span></label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => updateForm("password", e.target.value)}
                                                    className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={nextStep}
                                        className="w-full mt-6 rounded-2xl bg-gray-900 px-6 py-4 text-sm font-bold text-white shadow-xl hover:bg-black transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                                    >
                                        ขั้นตอนต่อไป (1/3) <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                    <p className="text-center text-sm font-bold text-gray-500 mt-4">
                                        มีบัญชีผู้ใช้งานแล้ว? <Link href="/login" className="text-brand-orange hover:underline">เข้าสู่ระบบ</Link>
                                    </p>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="rounded-3xl border border-brand-orange/20 bg-orange-50/50 p-6 flex items-start gap-4">
                                        <div className="mt-1 h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                            <Globe className="h-5 w-5 text-brand-orange" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 mb-1">ลิงก์สั่งอาหารประจำร้าน</p>
                                            <p className="text-sm font-medium text-gray-500 leading-relaxed">ลูกค้านำไปแกสนเปิดเมนู หรือ พิมพ์ URL นี้ผ่านเบราว์เซอร์เพื่อเข้าสู่ร้านของคุณได้เลยทันที</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อ URL ร้าน (ภาษาอังกฤษ ไม่มีเว้นวรรค) <span className="text-brand-orange">*</span></label>
                                        <div className="flex rounded-2xl border border-gray-200 bg-white/50 overflow-hidden focus-within:border-brand-orange focus-within:ring-4 focus-within:ring-orange-50 transition-all">
                                            <span className="flex items-center px-4 bg-gray-50 text-gray-500 font-bold text-sm border-r border-gray-200">
                                                tamjai.pro/
                                            </span>
                                            <input
                                                type="text"
                                                placeholder="your-store-name"
                                                value={formData.subdomain}
                                                onChange={(e) => updateForm("subdomain", e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                                className="w-full bg-transparent py-3 px-4 text-sm font-bold text-brand-orange outline-none placeholder:text-gray-300 placeholder:font-medium"
                                            />
                                        </div>
                                        {formData.subdomain && (
                                            <p className="mt-2 text-sm font-medium text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 className="h-4 w-4" /> ใช้ชื่อโดเมนนี้ได้
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-6">
                                        <button
                                            onClick={prevStep}
                                            className="w-1/3 rounded-2xl bg-white border border-gray-200 px-6 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                        >
                                            ย้อนกลับ
                                        </button>
                                        <button
                                            onClick={nextStep}
                                            className="w-2/3 rounded-2xl bg-gray-900 px-6 py-4 text-sm font-bold text-white shadow-xl hover:bg-black transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                                        >
                                            ขั้นตอนต่อไป (2/3) <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {/* Summary Card */}
                                    <div className="rounded-[2rem] border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center">
                                                <Store className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-lg text-gray-900">{formData.storeName || "ชื่อร้านของคุณ"}</p>
                                                <p className="text-sm font-bold text-brand-orange mt-0.5">tamjai.pro/{formData.subdomain || "your-store"}</p>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-gray-50/50 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-gray-400">เจ้าของร้าน</span>
                                                <span className="font-bold text-gray-900">{formData.fullName || "ยังไม่ระบุ"}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-gray-400">เบอร์ติดต่อ</span>
                                                <span className="font-bold text-gray-900">{formData.phone || "ยังไม่ระบุ"}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-gray-400">อีเมลล็อกอิน</span>
                                                <span className="font-bold text-gray-900">{formData.email || "ยังไม่ระบุ"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan Selection */}
                                    <div className="space-y-3">
                                        <p className="font-bold text-gray-900 text-sm pl-1">เลือกแพ็กเกจเริ่มต้น <span className="text-brand-orange">*</span></p>

                                        <label className={`block relative p-4 rounded-2xl border-2 transition-all ${!canRegisterFree ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : formData.plan === 'free' ? 'border-brand-orange bg-orange-50/50 cursor-pointer' : 'border-gray-200 bg-white hover:border-brand-orange/30 cursor-pointer'}`}>
                                            <input
                                                type="radio"
                                                name="plan"
                                                value="free"
                                                checked={formData.plan === 'free'}
                                                onChange={() => canRegisterFree && updateForm('plan', 'free')}
                                                disabled={!canRegisterFree}
                                                className="absolute opacity-0"
                                            />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-black text-gray-900">ทดลองใช้ฟรี 7 วัน</p>
                                                    <p className="text-xs font-medium text-gray-500 mt-1">
                                                        {!canRegisterFree
                                                            ? (isQuotaFull ? "โควตาสมัครฟรีเต็มแล้ว (จำกัด 10 ร้านค้า)" : "ระบบปิดรับสมัครทดลองใช้ฟรีกดชั่วคราว")
                                                            : "ใช้งานฟีเจอร์ Pro ได้เต็มรูปแบบ (ไม่ต้องแนบสลิป)"}
                                                    </p>
                                                </div>
                                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${formData.plan === 'free' ? 'border-brand-orange bg-brand-orange' : 'border-gray-300'}`}>
                                                    {formData.plan === 'free' && <div className="h-2 w-2 rounded-full bg-white"></div>}
                                                </div>
                                            </div>
                                            {!canRegisterFree && (
                                                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500">
                                                    <XCircle className="h-3 w-3" /> Unavailable
                                                </div>
                                            )}
                                        </label>

                                        {!canRegisterFree && (
                                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black text-red-900">ขออภัย โครงการนำร่องครบจำนวนแล้ว</p>
                                                    <p className="text-[10px] font-medium text-red-700 mt-0.5 leading-relaxed">
                                                        เนื่องจากมีผู้สนใจจำนวนมาก ขณะนี้โควตา 10 ร้านค้าแรกเต็มแล้ว กรุณาเลือกแพ็กเกจ Pro หรือติดต่อเจ้าหน้าที่เพื่อขอรับสิทธิ์พิเศษ
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <label className={`block relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.plan === 'pro' ? 'border-brand-orange bg-orange-50/50' : 'border-gray-200 bg-white hover:border-brand-orange/30'}`}>
                                            <input type="radio" name="plan" value="pro" checked={formData.plan === 'pro'} onChange={() => updateForm('plan', 'pro')} className="absolute opacity-0" />
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-black text-gray-900">Tamjai Pro (450฿/เดือน)</p>
                                                    <p className="text-xs font-medium text-gray-500 mt-1">สมัครและแนบสลิปทันทีเพื่อใช้งานไม่สะดุด</p>
                                                </div>
                                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${formData.plan === 'pro' ? 'border-brand-orange bg-brand-orange' : 'border-gray-300'}`}>
                                                    {formData.plan === 'pro' && <div className="h-2 w-2 rounded-full bg-white"></div>}
                                                </div>
                                            </div>

                                            {/* Dummy Slip Upload (Only when 'pro' is selected) */}
                                            {formData.plan === 'pro' && (
                                                <div className="mt-4 pt-4 border-t border-brand-orange/20 space-y-4">
                                                    <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">ช่องทางชำระเงิน</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">K-BANK</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">ธนาคารกสิกรไทย</p>
                                                                <p className="text-xs font-medium text-gray-500">012-3-45678-9 (บจก. ตามใจ โปร)</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 p-2 bg-orange-50 rounded-lg text-center">
                                                            <p className="text-[10px] font-bold text-brand-orange uppercase">ยอดโอน: 450.00 บาท</p>
                                                        </div>
                                                    </div>

                                                    <div className="relative border border-dashed border-brand-orange/50 bg-white rounded-xl p-4 text-center cursor-pointer hover:bg-orange-50/30 transition-colors">
                                                        <input
                                                            type="file"
                                                            accept="image/jpeg, image/png"
                                                            onChange={handleFileUpload}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        {slipFileName ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                                <p className="text-xs font-bold text-gray-900">{slipFileName}</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="text-xs font-bold text-brand-orange mb-1">+ แตะเพื่ออัปโหลดสลิปชำระเงิน</p>
                                                                <p className="text-[10px] text-gray-400">รองรับ JPG, PNG เท่านั้น</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <p className="text-[11px] font-bold text-gray-400 text-center px-4">
                                        การคลิกปุ่ม "ยืนยันการเปิดร้าน" หมายความว่าคุณยอมรับ <Link href="#" className="underline hover:text-gray-700">เงื่อนไขการให้บริการ</Link> และ <Link href="#" className="underline hover:text-gray-700">นโยบายความเป็นส่วนตัว</Link> ของเรา
                                    </p>

                                    {submitError && (
                                        <p className="text-sm font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2 mt-4 text-center">
                                            {submitError}
                                        </p>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={prevStep}
                                            disabled={isSubmitting}
                                            className="w-1/3 rounded-2xl bg-white border border-gray-200 px-6 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            ย้อนกลับ
                                        </button>
                                        <button
                                            onClick={submitForm}
                                            disabled={isSubmitting}
                                            className="w-2/3 rounded-2xl bg-brand-orange px-6 py-4 text-sm font-black text-white shadow-[0_10px_30px_rgba(255,107,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,107,0,0.4)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:hover:translate-y-0"
                                        >
                                            {isSubmitting ? "กำลังดำเนินการ..." : <>ยืนยันการเปิดร้าน <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-4 text-center"
                                >
                                    <div className="relative mb-5">
                                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                                        <div className="h-20 w-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center relative z-10 shadow-xl shadow-emerald-500/30">
                                            <CheckCircle2 className="h-10 w-10 text-white" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-gray-900 mb-2">ระบบได้รับคำขอเปิดร้านแล้ว 🎉</h3>
                                    <p className="text-gray-500 font-medium mb-6 text-sm max-w-[280px]">
                                        ทีมงานจะดำเนินการตรวจสอบและเปิดใช้งานระบบให้ภายใน <span className="font-bold text-gray-900">24 ชั่วโมง</span>
                                    </p>

                                    {/* Tracking Card */}
                                    <div className="w-full max-w-sm bg-gray-50 rounded-[1.5rem] p-6 text-center mb-6 border border-gray-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-brand-orange to-orange-300 left-0"></div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">รหัสตรวจสอบสถานะของคุณ</p>
                                        <div className="inline-flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2 mb-4">
                                            <span className="text-3xl font-black tracking-widest text-brand-orange">REF-9X2K</span>
                                        </div>

                                        <div className="bg-orange-50/50 rounded-xl p-4 text-left border border-orange-100">
                                            <div className="flex gap-3">
                                                <div className="shrink-0 mt-0.5">
                                                    <div className="h-4 w-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[10px] font-bold">1</div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 leading-tight">รอการอนุมัติร้านค้า</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">เมื่อทีมงานตรวจสอบข้อมูลเสร็จสิ้น คุณจะสามารถเข้าใช้งานได้ทันที</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                                        <a
                                            href="/track"
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-gray-200 hover:bg-black transition-all hover:-translate-y-0.5"
                                        >
                                            ตรวจสอบสถานะ
                                        </a>
                                        <a
                                            href="/"
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-all"
                                        >
                                            กลับหน้าหลัก
                                        </a>
                                    </div>

                                    <p className="text-xs text-brand-orange font-medium mt-4">
                                        * กรุณาแคปหน้าจอเก็บรหัส REF-9X2K ไว้
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Right Column: Visuals (Hidden on small screens) */}
            <div className="hidden lg:flex flex-1 bg-gray-900 relative items-center justify-center p-12 overflow-hidden">
                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-orange/20 rounded-full blur-[120px] mix-blend-screen translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen -translate-x-1/3 translate-y-1/3"></div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white mb-8 shadow-2xl">
                            <Store className="h-8 w-8" />
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                            ยกระดับร้านอาหารของคุณด้วย <span className="text-brand-orange">Tamjai Pro</span>
                        </h2>
                        <p className="text-lg text-gray-400 font-medium leading-relaxed mb-12">
                            เข้าร่วมกับร้านอาหารชั้นนำกว่า 1,000+ แห่งที่เลือกใช้ Tamjai เปลี่ยนระบบรับออเดอร์ให้เป็นอัตโนมัติ ลดข้อผิดพลาด เพิ่มยอดขาย
                        </p>

                        <div className="space-y-6">
                            {[
                                "หน้าร้านสวยงาม พร้อมระบบสั่งอาหารผ่าน QR",
                                "Dashboard จัดการออเดอร์ Real-time ไม่หน่วง",
                                "อิสระในการตกแต่ง ธีมสี โลโก้ ให้ตรงใจคุณ"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-gray-200">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Testimonial Float */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
                    className="absolute bottom-12 right-12 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] max-w-sm shadow-2xl"
                >
                    <div className="flex gap-1 text-amber-400 mb-3">★ ★ ★ ★ ★</div>
                    <p className="text-gray-300 font-medium italic text-sm mb-4">"ตั้งแต่ใช้ Tamjai Pro ออเดอร์ไม่เคยหล่นเลย ลูกค้าชมว่าสั่งง่ายมาก ประหยัดเวลาพนักงานไปได้เยอะ แนะนำเลยครับ"</p>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600"></div>
                        <div>
                            <p className="font-bold text-white text-sm">คุณบอย, สุกี้หม่าล่า</p>
                            <p className="text-xs font-bold text-gray-500">ใช้งานมาแล้ว 6 เดือน</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
