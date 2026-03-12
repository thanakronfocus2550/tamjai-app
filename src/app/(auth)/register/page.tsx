"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Store, User, Mail, Phone, Globe, CheckCircle2, ChevronRight, Lock, AlertCircle, XCircle, Bike, Check, LayoutGrid } from "lucide-react";
import LegalConsentCheckbox from "@/components/LegalConsentCheckbox";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        storeName: "",
        fullName: "",
        nickname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        subdomain: "",
        plan: "free" as "free" | "pro" | "pos",
        isTrial: true, // Default to trial for now
        couponCode: "",
        addBefriendService: false, // New service option
        posPin: "", // 6-digit POS PIN
        extra_info: "", // Honeypot field
    });

    const [acceptedLegal, setAcceptedLegal] = useState(false);
    const [receivedRefCode, setReceivedRefCode] = useState("");

    // Platform settings (usually fetched from an API)
    const isFreeTrialActive = true;
    const freeStoresCount = 1;
    const MAX_FREE_STORES = 10;
    const isQuotaFull = freeStoresCount >= MAX_FREE_STORES;
    const canRegisterFree = isFreeTrialActive && !isQuotaFull;

    // Default to 'pro' if free is not available
    React.useEffect(() => {
        if (!canRegisterFree) {
            setFormData(prev => ({ ...prev, plan: 'pro', isTrial: false }));
        }
    }, [canRegisterFree]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [slipFileName, setSlipFileName] = useState("");
    const [slipBase64, setSlipBase64] = useState("");
    const [paymentConfig, setPaymentConfig] = useState({ bankName: "", accountNo: "", accountName: "" });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Fetch config on mount
    React.useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("/api/config/payment");
                if (res.ok) {
                    const data = await res.json();
                    setPaymentConfig(data);
                }
            } catch (error) {
                console.error("Failed to fetch payment config:", error);
            }
        };
        fetchConfig();
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSlipFileName(file.name);

            // Read file as Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setSlipBase64(reader.result as string);
            };
        }
    };

    const updateForm = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validateStep1 = () => {
        const errors: Record<string, string> = {};

        if (!formData.storeName) {
            errors.storeName = "กรุณากรอกชื่อร้าน";
        } else if (formData.storeName.length < 3) {
            errors.storeName = "ชื่อร้านต้องมีความยาวอย่างน้อย 3 ตัวอักษร";
        } else if (formData.storeName.length > 50) {
            errors.storeName = "ชื่อร้านต้องมีความยาวไม่เกิน 50 ตัวอักษร";
        }
        if (!formData.fullName) errors.fullName = "กรุณากรอกชื่อ-นามสกุล";

        // Phone: Numeric only, 10 digits exactly
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            errors.phone = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก";
        }

        // Email: Gmail or Hotmail only
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
        if (!emailRegex.test(formData.email)) {
            errors.email = "รองรับเฉพาะ Gmail หรือ Hotmail เท่านั้น";
        }

        // Password: 8+ English chars only
        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            errors.password = "รหัสผ่านต้องเป็นภาษาอังกฤษ 8 ตัวขึ้นไป";
        }

        // Confirm Password check
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !formData.subdomain) {
            setFieldErrors({ subdomain: "กรุณาระบุ URL ร้านค้า" });
            return;
        }
        if (step < 5) {
            setFieldErrors({});
            setStep(step + 1);
        }
    };

    const submitForm = async () => {
        setIsSubmitting(true);
        setSubmitError("");

        try {
            const res = await fetch("/api/tenant/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    nickname: formData.nickname,
                    shopName: formData.storeName,
                    shopSlug: formData.subdomain,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    couponCode: formData.couponCode,
                    plan: formData.plan,
                    addBefriendService: formData.addBefriendService,
                    isTrial: formData.isTrial,
                    posPin: formData.plan === 'pos' ? formData.posPin : undefined,
                    slipBase64: (formData.plan === 'pro' || formData.plan === 'pos') && !formData.isTrial ? slipBase64 : undefined,
                    extra_info: formData.extra_info, // Honeypot data
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // Save the real REF code from server
            if (data.refCode) {
                setReceivedRefCode(data.refCode);
            }

            // Success! Move to Success state
            setStep(5);
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
                        initial={{ width: "20%" }}
                        animate={{ width: `${(step / 5) * 100}%` }}
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
                            {step === 3 && "เลือกแพ็กเกจที่คุณต้องการ"}
                            {step === 4 && (formData.isTrial ? "ยืนยันการรับสิทธิ์ทดลองใช้" : "ชำระเงินเพื่อยืนยันการสมัคร")}
                            {step === 5 && "ส่งคำขอเปิดร้านสำเร็จ!"}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {step === 1 && "กรอกข้อมูลพื้นฐานเพื่อสร้างหน้าร้านออนไลน์ของคุณ"}
                            {step === 2 && "ตั้งชื่อลิ้งค์ที่ลูกค้าจะใช้เข้ามาสั่งอาหาร (เปลี่ยนได้ภายหลัง)"}
                            {step === 3 && (canRegisterFree ? "เริ่มทดลองใช้ฟรี 7 วัน หรือเลือกสมัครแพ็กเกจที่เหมาะสมกับร้านคุณ" : "เลือกแพ็กเกจที่เหมาะกับความต้องการของร้านคุณ")}
                            {step === 4 && (formData.isTrial ? "ตรวจสอบความถูกต้องของข้อมูลก่อนเริ่มการทดลองใช้งาน" : "กรุณาโอนเงินและอัปโหลดสลิปเพื่อเข้าสู่ขั้นตอนการเปิดร้าน")}
                            {step === 5 && (formData.isTrial ? "รอสักครู่ ระบบกำลังเตรียมหน้าร้านให้คุณ โดยไม่ต้องตรวจสอบสลิปยืนยัน" : "กรุณารอผู้ดูแลระบบตรวจสอบข้อมูลและสลิปการโอนเงิน")}
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
                                        {/* Honeypot field (hidden from users) */}
                                        <div className="hidden" aria-hidden="true">
                                            <input
                                                type="text"
                                                name="extra_info"
                                                value={formData.extra_info}
                                                onChange={(e) => updateForm("extra_info", e.target.value)}
                                                tabIndex={-1}
                                                autoComplete="off"
                                            />
                                        </div>

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
                                                    className={`w-full rounded-2xl border ${fieldErrors.storeName ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-white/50'} py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none`}
                                                />
                                            </div>
                                            {fieldErrors.storeName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{fieldErrors.storeName}</p>}
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
                                                        placeholder="08XXXXXXXX"
                                                        value={formData.phone}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                            updateForm("phone", val);
                                                        }}
                                                        className={`w-full rounded-2xl border ${fieldErrors.phone ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-white/50'} py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none`}
                                                    />
                                                </div>
                                                {fieldErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{fieldErrors.phone}</p>}
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
                                                    placeholder="you@gmail.com หรือ hotmail.com"
                                                    value={formData.email}
                                                    onChange={(e) => updateForm("email", e.target.value)}
                                                    className={`w-full rounded-2xl border ${fieldErrors.email ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-white/50'} py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none`}
                                                />
                                            </div>
                                            {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{fieldErrors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">รหัสผ่าน <span className="text-brand-orange">*</span></label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    placeholder="ภาษาอังกฤษ 8 ตัวขึ้นไป"
                                                    value={formData.password}
                                                    onChange={(e) => updateForm("password", e.target.value)}
                                                    className={`w-full rounded-2xl border ${fieldErrors.password ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-white/50'} py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none`}
                                                />
                                            </div>
                                            {fieldErrors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{fieldErrors.password}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">ยืนยันรหัสผ่าน <span className="text-brand-orange">*</span></label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => updateForm("confirmPassword", e.target.value)}
                                                    className={`w-full rounded-2xl border ${fieldErrors.confirmPassword ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-white/50'} py-3 pl-11 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-50 outline-none`}
                                                />
                                            </div>
                                            {fieldErrors.confirmPassword && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{fieldErrors.confirmPassword}</p>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={nextStep}
                                        className="w-full mt-6 rounded-2xl bg-gray-900 px-6 py-4 text-sm font-bold text-white shadow-xl hover:bg-black transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                                    >
                                        ขั้นตอนต่อไป (1/4) <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                                            ขั้นตอนต่อไป (2/4) <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                                    {/* Plan Selection */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-bold text-gray-900 text-sm pl-1">เลือกแพ็กเกจที่คุณต้องการ <span className="text-brand-orange">*</span></p>

                                            {/* Trial/Paid Toggle */}
                                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => updateForm('isTrial', true as any)}
                                                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${formData.isTrial ? 'bg-white text-brand-orange shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    ทดลองฟรี 7 วัน
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateForm('isTrial', false as any)}
                                                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${!formData.isTrial ? 'bg-white text-brand-orange shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    สมัครใช้งานทันที
                                                </button>
                                            </div>
                                        </div>

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
                                                    <p className="font-black text-gray-900">ทดลองใช้ฟรี 7 วัน (FREE)</p>
                                                    <p className="text-xs font-medium text-gray-500 mt-1">
                                                        ทลองใช้ฟีเจอร์ Pro ทั้งหมด นาน 7 วัน เพื่อเริ่มเรียนรู้วิธีการใช้ระบบ
                                                    </p>
                                                </div>
                                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${formData.plan === 'free' ? 'border-brand-orange bg-brand-orange' : 'border-gray-300'}`}>
                                                    {formData.plan === 'free' && <div className="h-2 w-2 rounded-full bg-white"></div>}
                                                </div>
                                            </div>
                                        </label>

                                        <label className={`block relative p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${formData.plan === 'pro' ? 'border-brand-orange bg-orange-50/50 shadow-xl shadow-orange-100' : 'border-gray-200 bg-white hover:border-brand-orange/30'}`}>
                                            <input type="radio" name="plan" value="pro" checked={formData.plan === 'pro'} onChange={() => updateForm('plan', 'pro')} className="absolute opacity-0" />
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${formData.plan === 'pro' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Bike className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-lg">Tamjai Pro</p>
                                                        <p className="text-xs font-black text-brand-orange mt-0.5 tracking-wider uppercase">450฿ / เดือน</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1">เน้นจัดส่งและรับกลับบ้าน (Delivery & Pickup)</p>
                                                    </div>
                                                </div>
                                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.plan === 'pro' ? 'border-brand-orange bg-brand-orange scale-110 shadow-lg' : 'border-gray-200 bg-white'}`}>
                                                    {formData.plan === 'pro' && <Check className="h-4 w-4 text-white" strokeWidth={4} />}
                                                </div>
                                            </div>
                                        </label>

                                        <label className={`block relative p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${formData.plan === 'pos' ? 'border-brand-orange bg-orange-50/50 shadow-xl shadow-orange-100' : 'border-gray-200 bg-white hover:border-brand-orange/30'}`}>
                                            <input type="radio" name="plan" value="pos" checked={formData.plan === 'pos'} onChange={() => updateForm('plan', 'pos')} className="absolute opacity-0" />
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${formData.plan === 'pos' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        <LayoutGrid className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-black text-gray-900 text-lg">Tamjai POS</p>
                                                            <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Recommended</span>
                                                        </div>
                                                        <p className="text-xs font-black text-brand-orange mt-0.5 tracking-wider uppercase">600฿ / เดือน</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1">จัดการโต๊ะ + ระบบหน้าร้าน (Dine-in Terminal)</p>
                                                    </div>
                                                </div>
                                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.plan === 'pos' ? 'border-brand-orange bg-brand-orange scale-110 shadow-lg' : 'border-gray-200 bg-white'}`}>
                                                    {formData.plan === 'pos' && <Check className="h-4 w-4 text-white" strokeWidth={4} />}
                                                </div>
                                            </div>
                                        </label>

                                        {/* Coupon Code & Service Options */}
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 pl-1">โค้ดส่วนลด</label>
                                                <input
                                                    type="text"
                                                    placeholder="กรอกโค้ด (ถ้ามี)"
                                                    value={formData.couponCode}
                                                    onChange={(e) => updateForm("couponCode", e.target.value.toUpperCase())}
                                                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm font-bold text-gray-900 outline-none uppercase tracking-widest"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 pl-1">บริการเสริม</label>
                                                <div
                                                    onClick={() => updateForm("addBefriendService", !formData.addBefriendService as any)}
                                                    className={`w-full rounded-xl border py-2.5 px-3 flex items-center justify-between cursor-pointer transition-colors ${formData.addBefriendService ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-400'}`}
                                                >
                                                    <span className="text-[10px] font-bold">Befriend (+100฿)</span>
                                                    {formData.addBefriendService && <Check className="h-3 w-3" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
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
                                            ไปหน้าชำระเงิน <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {/* Order Summary */}
                                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm overflow-hidden">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">สรุปรายการสมัคร</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-bold">แพ็กเกจ:</span>
                                                <span className="text-gray-900 font-black uppercase">{formData.plan} {formData.isTrial ? "(Trial)" : ""}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-bold">ราคาแพ็กเกจ:</span>
                                                <span className="text-gray-900 font-black">{formData.isTrial ? "฿ 0.00" : `฿ ${formData.plan === 'pos' ? '600.00' : '450.00'}`}</span>
                                            </div>
                                            {formData.addBefriendService && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-emerald-600 font-bold">Befriend Service:</span>
                                                    <span className="text-emerald-600 font-black">+ ฿ 100.00</span>
                                                </div>
                                            )}
                                            {formData.couponCode === 'TAMJAI100' && !formData.isTrial && (
                                                <div className="flex justify-between items-center text-sm text-emerald-600">
                                                    <span className="font-bold">ส่วนลดคูปอง:</span>
                                                    <span className="font-black">- ฿ 100.00</span>
                                                </div>
                                            )}
                                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                                <span className="text-gray-900 font-black text-lg">ยอดโอนสุทธิ:</span>
                                                <span className="text-brand-orange font-black text-2xl">
                                                    ฿ {(formData.isTrial ? 0 : (formData.plan === 'pos' ? 600 : (formData.couponCode === 'TAMJAI100' ? 350 : 450)) + (formData.addBefriendService ? 100 : 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {!formData.isTrial ? (
                                        <div className="space-y-5">
                                            {/* Bank Detail & QR Code */}
                                            <div className="bg-orange-50 border border-orange-100 rounded-[2.5rem] p-6 text-center space-y-4">
                                                <p className="text-[10px] font-black uppercase text-orange-600 tracking-[0.2em]">สแกนชำระเงินผ่าน QR Code</p>
                                                <div className="inline-block p-4 bg-white rounded-3xl shadow-lg border border-orange-100">
                                                    {/* Using QR Server API with mock promptpay data */}
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMPTPAY|${paymentConfig.accountNo}|${(formData.plan === 'pos' ? 600 : (formData.couponCode === 'TAMJAI100' ? 350 : 450)) + (formData.addBefriendService ? 100 : 0)}`}
                                                        alt="PromptPay QR"
                                                        className="h-40 w-40"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-gray-900">{paymentConfig.bankName}</p>
                                                    <p className="text-sm font-bold text-gray-500">{paymentConfig.accountNo} ({paymentConfig.accountName})</p>
                                                </div>
                                            </div>

                                            {/* Slip Upload */}
                                            <div className="relative group">
                                                <div className="absolute inset-x-0 -bottom-1 h-full bg-brand-orange/5 rounded-2xl scale-[1.02] transition-transform group-hover:scale-[1.03]"></div>
                                                <div className="relative border-2 border-dashed border-brand-orange/30 bg-white rounded-2xl p-6 text-center cursor-pointer hover:border-brand-orange/60 transition-all">
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg, image/png"
                                                        onChange={handleFileUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    {slipFileName ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="h-10 w-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                                <Check className="h-6 w-6" strokeWidth={4} />
                                                            </div>
                                                            <p className="text-sm font-black text-gray-900">{slipFileName}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase">แตะเพื่อเปลี่ยนไฟล์</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="h-12 w-12 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-2">
                                                                <ArrowRight className="h-6 w-6 rotate-[270deg]" />
                                                            </div>
                                                            <p className="text-sm font-black text-brand-orange uppercase tracking-wider">อัปโหลดสลิปชำระเงิน <span className="text-red-500">*</span></p>
                                                            <p className="text-[10px] text-gray-400 font-medium">รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG)</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
                                            <div className="flex items-start gap-3">
                                                <div className="h-6 w-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-emerald-500/20">
                                                    <Check className="h-4 w-4" strokeWidth={4} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-emerald-900">โปรโมชั่น: ทดลองใช้ฟรี 7 วัน</p>
                                                    <p className="text-xs text-emerald-700 font-medium mt-1 leading-relaxed">
                                                        คุณกำลังเลือกทดลองใช้งานโดยไม่เสียค่าใช้จ่าย ระบบจะทำการเปิดร้านให้คุณทันทีหลังจากกดปุ่มยืนยัน โดยคุณสามารถอัปเกรดแพ็กเกจได้ทุกเมื่อภายหลัง
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* POS PIN for POS plan users */}
                                    {formData.plan === 'pos' && (
                                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-orange-600 mb-2 pl-1">ตั้งรหัสผ่านเครื่อง POS (6 หลัก)</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    placeholder="เช่น 123456"
                                                    value={formData.posPin}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                                        updateForm("posPin", val);
                                                    }}
                                                    className="w-full rounded-xl border border-orange-200 bg-white py-2.5 pl-10 pr-4 text-sm font-black text-brand-orange outline-none tracking-[0.5em]"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <LegalConsentCheckbox checked={acceptedLegal} onChange={setAcceptedLegal} />
                                    </div>

                                    {submitError && (
                                        <p className="text-sm font-black text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center animate-shake">
                                            {submitError}
                                        </p>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={prevStep}
                                            disabled={isSubmitting}
                                            className="w-1/3 rounded-2xl bg-white border border-gray-200 px-6 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            ย้อนกลับ
                                        </button>
                                        <button
                                            onClick={submitForm}
                                            disabled={isSubmitting || !acceptedLegal || (!formData.isTrial && !slipBase64)}
                                            className="w-2/3 rounded-2xl bg-brand-orange px-6 py-4 text-sm font-black text-white shadow-[0_10px_30px_rgba(255,107,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,107,0,0.4)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            {isSubmitting ? "กำลังเปิดร้าน..." : <>ยืนยันการเปิดร้าน <ChevronRight className="h-5 w-5" /></>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-6 text-center"
                                >
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                                        <div className="h-24 w-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[2.5rem] flex items-center justify-center relative z-10 shadow-2xl shadow-emerald-500/30 rotate-3">
                                            <CheckCircle2 className="h-12 w-12 text-white" />
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">สมัครสมาชิกสำเร็จ! 🎉</h3>
                                    <p className="text-gray-500 font-medium mb-10 text-sm max-w-[320px] leading-relaxed">
                                        {formData.isTrial
                                            ? "ระบบเปิดร้านให้คุณทันที! คุณสามารถเริ่มใช้งานฟีเจอร์ต่างๆ ได้เลยครับ"
                                            : "ทีมงานได้รับข้อมูลแล้ว จะตรวจสอบและอนุมัติร้านค้าให้คุณภายใน 24 ชม. ครับ"}
                                    </p>

                                    {/* Tracking Card */}
                                    <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 text-center mb-10 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden group">
                                        <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-brand-orange to-orange-400 left-0 transition-all group-hover:h-2"></div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">รหัสติดตามสถานะของคุณ</p>
                                        <div className="inline-flex items-center justify-center bg-gray-50 border border-gray-100 shadow-inner rounded-2xl px-8 py-4 mb-6">
                                            <span className="text-4xl font-black tracking-[0.2em] text-brand-orange">{receivedRefCode || "REF-XXXX"}</span>
                                        </div>

                                        <div className="bg-emerald-50/50 rounded-2xl p-5 text-left border border-emerald-100">
                                            <div className="flex gap-4">
                                                <div className="shrink-0">
                                                    <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-500/20">!</div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-emerald-900 leading-tight">ขั้นตอนถัดไป</p>
                                                    <p className="text-[10px] text-emerald-600/80 mt-1 font-bold leading-snug">
                                                        {formData.isTrial
                                                            ? "ลงชื่อเข้าใช้งานที่หน้า Admin โดยใช้อีเมลและรหัสผ่านที่คุณเป็นคนตั้ง"
                                                            : "กรุณารอรับการแจ้งเตือนทางอีเมลเมื่อการโอนเงินได้รับการยืนยัน"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                                        <Link
                                            href="/track"
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 text-sm font-black text-white shadow-xl shadow-gray-200 hover:bg-black transition-all hover:-translate-y-1 active:scale-95"
                                        >
                                            ตรวจสอบสถานะ
                                        </Link>
                                        <Link
                                            href="/"
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-100 px-6 py-4 text-sm font-black text-gray-600 hover:bg-gray-50 transition-all hover:-translate-y-1 active:scale-95"
                                        >
                                            กลับหน้าหลัก
                                        </Link>
                                    </div>

                                    <p className="text-[10px] text-gray-400 font-bold mt-8 uppercase tracking-widest">
                                        * กรุณาบันทึกภาพหน้าจอนี้ไว้เพื่อเป็นหลักฐาน
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div >
            </div >

            {/* Right Column: Visuals (Hidden on small screens) */}
            < div className="hidden lg:flex flex-1 bg-gray-900 relative items-center justify-center p-12 overflow-hidden" >
                {/* Abstract background elements */}
                < div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-orange/20 rounded-full blur-[120px] mix-blend-screen translate-x-1/3 -translate-y-1/3" ></div >
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
                            <p className="text-xs font-bold text-gray-500">ใช้งานมานานกว่า 6 เดือน</p>
                        </div>
                    </div>
                </motion.div>
            </div >
        </div >
    );
}
