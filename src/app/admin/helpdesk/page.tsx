"use client";

import { motion, Variants, AnimatePresence } from "framer-motion";
import { Search, Filter, MessageSquare, AlertCircle, CheckCircle2, Clock, Eye, X, Send, User, Building, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function HelpdeskPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyText, setReplyText] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("All");

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/admin/helpdesk");
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    const openCount = tickets.filter(t => t.status === "OPEN").length;
    const progressCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
    const resolvedCount = tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length;
    const allCount = tickets.length;

    const filteredTickets = filterStatus === "All"
        ? tickets
        : filterStatus === "Resolved/Closed"
            ? tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED")
            : tickets.filter(t => t.status === filterStatus);

    const handleSendReply = async () => {
        if (!replyText) return;
        try {
            const res = await fetch("/api/admin/helpdesk", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedTicket.id,
                    reply: replyText
                })
            });
            if (res.ok) {
                alert(`ส่งข้อความตอบกลับสำเร็จ!`);
                setReplyText("");
                fetchTickets();
                setSelectedTicket(null);
            }
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการส่งข้อความ");
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/admin/helpdesk", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                fetchTickets();
                if (selectedTicket?.id === id) {
                    setSelectedTicket(null);
                }
            }
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold">กำลังโหลดข้อมูล Helpdesk...</p>
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-black tracking-tight text-gray-900 inline-flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-brand-orange" />
                        ข้อร้องเรียน & ช่วยเหลือ (Helpdesk)
                    </motion.h1>
                    <motion.p variants={itemVariants} className="mt-1 text-sm font-medium text-gray-500">
                        จัดการปัญหา ให้ความช่วยเหลือ และตอบข้อซักถามของร้านค้า
                    </motion.p>
                </div>
            </div>

            <motion.div variants={itemVariants} className="grid sm:grid-cols-4 gap-6">
                {[
                    { label: "รอการแก้ไข (Open)", status: "OPEN", count: openCount, color: "text-red-500", bg: "bg-red-50", icon: AlertCircle },
                    { label: "กำลังดำเนินการ", status: "IN_PROGRESS", count: progressCount, color: "text-amber-500", bg: "bg-amber-50", icon: Clock },
                    { label: "แก้ไขแล้ว", status: "Resolved/Closed", count: resolvedCount, color: "text-emerald-500", bg: "bg-emerald-50", icon: CheckCircle2 },
                    { label: "ทั้งหมด", status: "All", count: allCount, color: "text-brand-orange", bg: "bg-orange-50", icon: MessageSquare },
                ].map((stat, i) => (
                    <button
                        key={i}
                        onClick={() => setFilterStatus(stat.status)}
                        className={`rounded-2xl border text-left p-5 flex items-center gap-4 transition-all hover:shadow-md 
                            ${filterStatus === stat.status ? 'border-brand-orange bg-white shadow-md ring-1 ring-brand-orange/20 scale-[1.02]' : 'border-gray-200 bg-white shadow-sm hover:border-orange-200'}`}
                    >
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                            ${filterStatus === stat.status ? 'bg-orange-500 text-white shadow-inner' : `${stat.bg} ${stat.color}`}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className={`text-xs font-bold ${filterStatus === stat.status ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.count}</p>
                        </div>
                    </button>
                ))}
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="ค้นหา Ticket ID, ชื่อร้าน..." className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-orange-50" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Ticket Info</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTickets.map((t: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{t.ticketId}</p>
                                        <p className="text-gray-500 font-medium text-xs mt-0.5">{t.tenant?.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-700 max-w-xs truncate">{t.subject}</p>
                                        <p className="text-gray-400 font-medium text-[10px] mt-1">{new Date(t.createdAt).toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase
                                            ${t.priority === 'CRITICAL' ? 'bg-purple-100 text-purple-700' :
                                                t.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                    t.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-600'}
                                        `}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                             ${t.status === 'OPEN' ? 'bg-red-50 text-red-600' :
                                                t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                                                    t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' :
                                                        'bg-gray-100 text-gray-600'}
                                         `}>
                                            {t.status === 'OPEN' && <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedTicket(t)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 group-hover:border-brand-orange group-hover:text-brand-orange transition-colors"
                                        >
                                            <Eye className="h-4 w-4" /> ดูรายละเอียด
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Ticket Detail Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTicket(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="relative w-full max-w-4xl h-[90vh] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col sm:flex-row"
                        >
                            {/* Sidebar Info */}
                            <div className="w-full sm:w-80 bg-gray-50 border-r border-gray-100 p-8">
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="mb-8 p-2 rounded-xl bg-white text-gray-400 hover:text-gray-900 shadow-sm transition-all active:scale-95"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Ticket ID</p>
                                        <h4 className="text-xl font-black text-gray-900">{selectedTicket.ticketId}</h4>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-brand-orange">
                                                <Building className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">ร้านค้า</p>
                                                <p className="font-bold text-gray-900 text-sm">{selectedTicket.tenant?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-500">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">เจ้าของร้าน</p>
                                                <p className="font-bold text-gray-900 text-sm">{selectedTicket.ownerName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">ลำดับความสำคัญ</p>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase
                                                ${selectedTicket.priority === 'CRITICAL' ? 'bg-purple-100 text-purple-700' :
                                                    selectedTicket.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
                                            `}>
                                                {selectedTicket.priority}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">สถานะ</p>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase
                                                ${selectedTicket.status === 'OPEN' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}
                                            `}>
                                                {selectedTicket.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Chat/Support Area */}
                            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                                <div className="p-8 border-b border-gray-100 bg-white/50 backdrop-blur">
                                    <h3 className="text-xl font-black text-gray-900 leading-tight">
                                        {selectedTicket.subject}
                                    </h3>
                                    <p className="text-xs font-bold text-gray-400 mt-2">เปิดเมื่อ {selectedTicket.created}</p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                                    {/* Subject and Created At */}
                                    <div className="mb-4">
                                        <p className="text-sm font-bold text-gray-700">{selectedTicket.subject}</p>
                                    </div>

                                    {/* Messages from Database */}
                                    {(selectedTicket.messages as any[] || []).map((msg: any, idx: number) => (
                                        <div key={idx} className={`flex gap-4 ${msg.role === 'admin' ? 'flex-row-reverse text-right' : ''}`}>
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black shrink-0 ${msg.role === 'admin' ? 'bg-gray-900 text-white' : 'bg-brand-orange text-white'}`}>
                                                {msg.role === 'admin' ? 'A' : (selectedTicket.tenant?.name?.[0] || 'M')}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`p-5 shadow-sm border ${msg.role === 'admin' ? 'bg-gray-900 text-white rounded-tl-[1.5rem] rounded-b-[1.5rem]' : 'bg-white text-gray-700 rounded-tr-[1.5rem] rounded-b-[1.5rem] border-gray-100'}`}>
                                                    <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 mt-2">{msg.role === 'admin' ? 'Admin' : 'Merchant'} • {new Date(msg.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {(selectedTicket.messages as any[]).length === 0 && (
                                        <div className="text-center py-10 text-gray-400">
                                            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                            <p className="font-bold">ไม่มีประวัติการสนทนา</p>
                                        </div>
                                    )}
                                </div>

                                {/* Reply Area */}
                                <div className="p-8 border-t border-gray-100 bg-white">
                                    <div className="relative group">
                                        <textarea
                                            placeholder="พิมพ์ข้อความตอบกลับร้านค้า..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendReply();
                                                }
                                            }}
                                            className="w-full h-32 rounded-[2rem] border border-gray-200 bg-gray-50 p-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all resize-none pr-16"
                                        ></textarea>
                                        <button
                                            onClick={handleSendReply}
                                            className="absolute bottom-4 right-4 h-12 w-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-90"
                                        >
                                            <Send className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket.id, "RESOLVED")}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all"
                                            >
                                                <CheckCircle2 className="h-3 w-3" /> Mark Resolved
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket.id, "IN_PROGRESS")}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all"
                                            >
                                                <Clock className="h-3 w-3" /> Set In-Progress
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 italic">การพิมพ์ตอบกลับจะถูกส่งไปยัง LINE OA หรือ Email ของหน้าร้านค้า</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
