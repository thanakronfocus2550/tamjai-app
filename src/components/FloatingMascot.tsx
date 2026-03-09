"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bug, Send, Sparkles } from "lucide-react";

export default function FloatingMascot({ shopSlug }: { shopSlug?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    // Helpdesk Form State
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/helpdesk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    shopSlug: shopSlug || "general", 
                    subject, 
                    message,
                    status: "PENDING"
                }),
            });
            
            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setIsSuccess(false);
                    setSubject("");
                    setMessage("");
                }, 3000);
            } else {
                alert("เกิดปัญหา ไม่สามารถส่งข้อความได้");
            }
        } catch (error) {
            console.error("Helpdesk error:", error);
            alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            
            {/* Expanded Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[340px] overflow-hidden rounded-[2rem] bg-white shadow-2xl border border-orange-100 origin-bottom-right"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-br from-brand-orange to-orange-400 p-5 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Sparkles className="h-16 w-16" />
                            </div>
                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <h3 className="font-black text-lg drop-shadow-sm">น้องตามใจ AI Support</h3>
                                    <p className="text-white/80 text-xs font-medium mt-0.5">แจ้งปัญหาหรือสอบถามข้อมูล</p>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-md"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            {isSuccess ? (
                                <div className="py-8 text-center space-y-3">
                                    <div className="h-16 w-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckIcon className="h-8 w-8" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-lg">ส่งข้อมูลสำเร็จ!</h4>
                                    <p className="text-sm text-gray-500">น้องตามใจได้รับเรื่องแล้ว ทีมงานจะรีบตรวจสอบและติดต่อกลับโดยเร็วที่สุดนะคะ</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase text-gray-400 tracking-wider">หัวข้อ</label>
                                        <select 
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:bg-white transition-all font-semibold text-gray-700"
                                        >
                                            <option value="" disabled>-- เลือกหัวข้อ --</option>
                                            <option value="แจ้งปัญหาการใช้งาน (Bug)">แจ้งปัญหาการใช้งาน (Bug)</option>
                                            <option value="สอบถามฟีเจอร์ใหม่">สอบถามฟีเจอร์ใหม่</option>
                                            <option value="ปัญหาเรื่องบิล/การชำระเงิน">ปัญหาเรื่องบิล / การชำระเงิน</option>
                                            <option value="ต้องการความช่วยเหลือทั่วไป">ต้องการความช่วยเหลือทั่วไป</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase text-gray-400 tracking-wider">รายละเอียดปัญหา</label>
                                        <textarea 
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                            placeholder="กรุณาอธิบายปัญหาที่คุณพบให้น้องตามใจทราบหน่อยนะคะ..."
                                            rows={4}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:bg-white transition-all resize-none text-gray-700"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting || !subject || !message}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-black text-white shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            "กำลังส่งข้อมูล..."
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                                                ส่งข้อความให้น้องตามใจ
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Mascot Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group"
            >
                {/* Speech Bubble (Hover) */}
                <AnimatePresence>
                    {isHovered && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.9 }}
                            className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[1.5rem] rounded-br-[4px] bg-white px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-orange-100"
                        >
                            <p className="text-sm font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-orange-400">แจ้งปัญหา/สอบถาม</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Avatar Circle Container */}
                <div className="relative h-[85px] w-[85px] rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-white flex items-center justify-center overflow-visible group-hover:shadow-[0_8px_40px_rgba(255,107,0,0.3)] transition-shadow">
                    
                    {/* Glowing effect behind mascot */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-brand-orange opacity-15 animate-pulse"></div>
                    
                    {/* The Mascot Image itself */}
                    <div className="absolute bottom-[-5px] h-[125%] w-[125%] pointer-events-none drop-shadow-md">
                        <img 
                            src="/images/ai-mascot.png" 
                            alt="Tamjai AI Mascot"
                            className={`w-full h-full object-contain object-bottom transition-transform duration-300 ${isOpen ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-1.5'}`}
                        />
                    </div>
                </div>

                {/* Notification dot */}
                {!isOpen && (
                    <div className="absolute -top-1 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 ring-4 ring-white shadow-sm z-10 animate-bounce">
                        <Bug className="h-3.5 w-3.5 text-white" />
                    </div>
                )}
            </button>
        </div>
    );
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
