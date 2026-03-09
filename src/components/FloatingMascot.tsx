"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bug, Send, Sparkles } from "lucide-react";

export default function FloatingMascot({ shopSlug }: { shopSlug?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // View Mode: 'chat' or 'ticket'
    const [mode, setMode] = useState<"chat" | "ticket">("chat");

    // Chat State
    const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([
        { role: "model", content: "สวัสดีค่ะ! มีอะไรให้น้องตามใจช่วยดูแลไหมคะ? สอบถามฟีเจอร์หรือแจ้งปัญหาได้เลยนะคะ" }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    // Helpdesk Form State
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        if (typeof window !== "undefined") {
            const minimized = sessionStorage.getItem("minimizedMascot");
            if (minimized) setIsMinimized(true);
        }
    }, []);

    const handleMinimize = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMinimized(true);
        sessionStorage.setItem("minimizedMascot", "true");
    };

    const handleRestore = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMinimized(false);
        sessionStorage.removeItem("minimizedMascot");
    };



    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isThinking) return;

        const userMsg = chatInput.trim();
        setChatInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsThinking(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg, shopSlug: shopSlug || "general" }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: "model", content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: "model", content: "ขออภัยค่ะ พอดีช่วงนี้คนคุยกับน้องตามใจเยอะมาก รบกวนลองใหม่อีกสักครู่นะคะ" }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "model", content: "เกิดข้อขัดข้องทางเทคนิคค่ะ รบกวนลองใหม่อีกครั้งนะคะ" }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Auto-scroll chat
    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    if (!isMounted) return null;

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
                        <div className="bg-gradient-to-br from-brand-orange to-orange-400 p-4 text-white relative overflow-hidden flex flex-col gap-3">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Sparkles className="h-16 w-16" />
                            </div>
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-white/20 p-0.5 backdrop-blur-md">
                                        <img src="/images/ai-mascot.png" alt="Mascot" className="h-full w-full object-cover rounded-full" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm drop-shadow-sm leading-tight">น้องตามใจ AI Support</h3>
                                        <p className="text-white/80 text-[10px] font-medium mt-0.5">พร้อมตอบคำถามทันที (24 ชม.)</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-md shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex bg-black/20 rounded-full p-1 relative z-10">
                                <button
                                    onClick={() => setMode("chat")}
                                    className={`flex-1 text-xs font-bold py-1.5 rounded-full transition-all ${mode === "chat" ? "bg-white text-brand-orange shadow-sm" : "text-white/70 hover:text-white"}`}
                                >
                                    💬 คุยกับ AI
                                </button>
                                <button
                                    onClick={() => setMode("ticket")}
                                    className={`flex-1 text-xs font-bold py-1.5 rounded-full transition-all ${mode === "ticket" ? "bg-white text-brand-orange shadow-sm" : "text-white/70 hover:text-white"}`}
                                >
                                    🎫 แจ้งปัญหา
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="h-[320px] flex flex-col bg-gray-50/50">
                            {mode === "chat" ? (
                                <>
                                    {/* Chat History */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                                        {messages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                                                    ? 'bg-brand-orange text-white rounded-br-sm'
                                                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                                                    }`}>
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {isThinking && (
                                            <div className="flex justify-start">
                                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/40 animate-bounce"></span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/60 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/80 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-3 bg-white border-t border-gray-100">
                                        <form onSubmit={handleChatSubmit} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="พิมพ์ถามน้องตามใจได้เลย..."
                                                disabled={isThinking}
                                                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:bg-white transition-all disabled:opacity-50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isThinking || !chatInput.trim()}
                                                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-brand-orange text-white shadow-md shadow-orange-500/20 disabled:opacity-50 hover:bg-orange-600 transition-colors"
                                            >
                                                <Send className="h-4 w-4 ml-0.5" />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="p-5 overflow-y-auto">
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
                                                        ส่งข้อความทีมงาน
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Mascot Button */}
            <div className="relative mt-2">
                <AnimatePresence mode="wait">
                    {isMinimized ? (
                        <motion.button
                            key="minimized"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={handleRestore}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border-2 border-orange-100 hover:scale-110 active:scale-95 transition-transform"
                            title="เรียกน้องตามใจ"
                        >
                            <img
                                src="/images/ai-mascot.png"
                                alt="Tamjai AI Mascot"
                                className="h-full w-full object-cover rounded-full mt-1"
                            />
                        </motion.button>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="relative"
                        >
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
                                <div className="relative h-[75px] w-[75px] rounded-full bg-orange-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-[3px] border-white flex items-center justify-center overflow-hidden group-hover:shadow-[0_8px_40px_rgba(255,107,0,0.3)] transition-shadow">
                                    <img
                                        src="/images/ai-mascot.png"
                                        alt="Tamjai AI Mascot"
                                        className={`w-[130%] h-[130%] object-cover object-top mt-2 transition-transform duration-300 ${isOpen ? 'scale-110' : 'group-hover:scale-110'}`}
                                    />
                                </div>

                                {/* Notification dot */}
                                {!isOpen && (
                                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 ring-2 ring-white shadow-sm z-10 animate-bounce">
                                        <Bug className="h-3.5 w-3.5 text-white" />
                                    </div>
                                )}
                            </button>

                            {/* Close Button to hide mascot entirely */}
                            {!isOpen && (
                                <button
                                    onClick={handleMinimize}
                                    className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white shadow-sm z-20 hover:bg-gray-200 text-gray-500 transition-colors"
                                    title="ย่อน้องตามใจ"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
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
