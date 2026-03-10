"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Megaphone,
    Send,
    Clock,
    Type,
    FileText,
    AlertCircle,
    CheckCircle2,
    Info,
    Trash2,
    Calendar,
    Users
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale/th";

export default function BroadcastPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("INFO");
    const [isGlobal, setIsGlobal] = useState(true);
    const [expiresAt, setExpiresAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);

    const fetchBroadcasts = async () => {
        try {
            const res = await fetch("/api/admin/broadcast");
            if (res.ok) {
                const data = await res.json();
                setBroadcasts(data);
            }
        } catch (error) {
            console.error("Failed to fetch broadcasts", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content,
                    type,
                    isGlobal,
                    expiresAt: expiresAt || null
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTitle("");
                setContent("");
                fetchBroadcasts();
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to send broadcast", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                        <Megaphone className="h-8 w-8 text-brand-orange" />
                        Merchant Broadcast
                    </h1>
                    <p className="mt-1 text-sm font-medium text-gray-500">ส่งประกาศและแจ้งเตือนถึงเจ้าของร้านทุกท่านในระบบ</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100"
                >
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                        <Send className="h-5 w-5 text-brand-orange" />
                        สร้างประกาศใหม่
                    </h2>

                    <form onSubmit={handleSend} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Type className="h-4 w-4" /> หัวข้อประกาศ
                            </label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="เช่น: อัปเดตระบบประจำเดือนมีนาคม..."
                                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm font-bold outline-none focus:border-brand-orange focus:bg-white transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> เนื้อหาประกาศ
                            </label>
                            <textarea
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                placeholder="รายละเอียดที่ต้องการแจ้งให้เจ้าของร้านทราบ..."
                                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm font-bold outline-none focus:border-brand-orange focus:bg-white transition-all shadow-inner resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> ประเภท
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm font-bold outline-none focus:border-brand-orange focus:bg-white transition-all shadow-sm"
                                >
                                    <option value="INFO">ℹ️ ทั่วไป (Info)</option>
                                    <option value="SUCCESS">✅ ข่าวดี (Success)</option>
                                    <option value="WARNING">⚠️ แจ้งเตือน (Warning)</option>
                                    <option value="URGENT">🚨 ด่วนที่สุด (Urgent)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> วันหมดอายุ (ถ้ามี)
                                </label>
                                <input
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm font-bold outline-none focus:border-brand-orange focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange text-white shadow-lg">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900">ประกาศถึงทุกร้านค้า</p>
                                <p className="text-[10px] font-bold text-orange-600">ข้อความนี้จะไปปรากฏบนแดชบอร์ดของทุกร้าน</p>
                            </div>
                            <div className="ml-auto">
                                <button
                                    type="button"
                                    onClick={() => setIsGlobal(!isGlobal)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isGlobal ? 'bg-brand-orange' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isGlobal ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full rounded-2xl bg-gray-900 text-white p-5 font-black text-lg shadow-xl hover:bg-black hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                            ) : success ? (
                                <><CheckCircle2 className="h-6 w-6 text-emerald-400" /> ส่งประกาศสำเร็จ!</>
                            ) : (
                                <><Send className="h-6 w-6" /> ยืนยันการส่งประกาศ</>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* History Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400" />
                            ประวัติการประกาศล่าสุด
                        </h2>
                        <span className="text-xs font-bold text-gray-400">{broadcasts.length} รายการ</span>
                    </div>

                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                        {fetching ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-[2rem]"></div>)}
                            </div>
                        ) : broadcasts.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center text-gray-400">
                                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="font-bold">ยังไม่มีประวัติการประกาศ</p>
                            </div>
                        ) : (
                            broadcasts.map((b) => (
                                <motion.div
                                    key={b.id}
                                    layout
                                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            {b.type === 'URGENT' ? (
                                                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                                            ) : (
                                                <span className={`h-2 w-2 rounded-full ${b.type === 'SUCCESS' ? 'bg-emerald-500' :
                                                        b.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                                                    }`}></span>
                                            )}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {format(new Date(b.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                                            </span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-black text-gray-900 mb-2">{b.title}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                                        {b.content}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                            {b.type === 'INFO' && <Info className="h-3 w-3 text-blue-500" />}
                                            {b.type === 'SUCCESS' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                            {b.type === 'WARNING' && <AlertCircle className="h-3 w-3 text-amber-500" />}
                                            {b.type === 'URGENT' && <AlertCircle className="h-3 w-3 text-red-500" />}
                                            <span>{b.type}</span>
                                        </div>
                                        <div className="text-gray-400">By: {b.author}</div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
