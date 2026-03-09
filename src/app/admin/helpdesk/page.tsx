"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CheckCircle2, Clock, Inbox, RefreshCw, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function HelpdeskAdminPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/helpdesk");
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        // Optimistic UI update
        setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));

        try {
            // Note: will require a PATCH endpoint to fully implement
            // await fetch(`/api/admin/helpdesk/${id}`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
        } catch (error) {
            console.error(error);
        }
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                    <Clock className="w-3.5 h-3.5" /> รอดำเนินการ
                </span>;
            case 'IN_PROGRESS':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> กำลังตรวจสอบ
                </span>;
            case 'RESOLVED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> แก้ไขแล้ว
                </span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                    {status}
                </span>;
        }
    };

    if (session?.user?.role !== "SUPER_ADMIN") return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Inbox className="w-8 h-8 text-brand-orange" />
                        ข้อร้องเรียน & ช่วยเหลือ (Helpdesk)
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        จัดการปัญหาและข้อเสนอแนะทั้งหมดจากร้านค้าและผู้ใช้งานทั่วไป
                    </p>
                </div>
                <button
                    onClick={fetchTickets}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors shadow-sm active:scale-95"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรชข้อมูล
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <RefreshCw className="w-8 h-8 mx-auto text-brand-orange animate-spin mb-4" />
                    <p className="text-gray-500 font-medium tracking-wide">กำลังโหลดรายการแจ้งปัญหา...</p>
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">ยอดเยี่ยม! ไม่มีปัญหาค้างในระบบ</h3>
                    <p className="text-gray-500 font-medium">จัดการทุกปัญหาเสร็จสิ้น ระบบทำงานได้ราบรื่น</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ผู้แจ้ง (ร้านค้า)</th>
                                    <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">หัวข้อและรายละเอียด</th>
                                    <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">สถานะ</th>
                                    <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">เวลาที่แจ้ง</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-orange-50/20 transition-colors group">
                                        <td className="py-5 px-6 align-top">
                                            <div className="font-bold text-gray-900 whitespace-nowrap flex items-center gap-2">
                                                {ticket.shopSlug === 'general' ? (
                                                    <span className="flex items-center gap-1 text-blue-600"><AlertTriangle className="w-3.5 h-3.5" /> ผู้ใช้งานทั่วไป</span>
                                                ) : (
                                                    ticket.shopName
                                                )}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest border border-gray-200 rounded-md px-1.5 py-0.5 inline-block bg-gray-50">
                                                {ticket.shopSlug === 'general' ? 'PUBLIC_USER' : ticket.shopSlug}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 align-top w-full max-w-xl">
                                            <div className="font-bold text-gray-900 mb-1.5">{ticket.subject}</div>
                                            <p className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                {ticket.message}
                                            </p>
                                        </td>
                                        <td className="py-5 px-6 align-top text-center h-full">
                                            <div className="flex flex-col items-center gap-2">
                                                {renderStatusBadge(ticket.status)}

                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                                                    {ticket.status !== 'RESOLVED' && (
                                                        <button
                                                            onClick={() => updateStatus(ticket.id, 'RESOLVED')}
                                                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                                                            title="ทำเครื่องหมายว่าแก้ไขแล้ว"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {ticket.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => updateStatus(ticket.id, 'IN_PROGRESS')}
                                                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                                            title="กำลังตรวจสอบ"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 align-top text-right whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {format(new Date(ticket.createdAt), "d MMM yyyy", { locale: th })}
                                            </div>
                                            <div className="text-xs font-medium text-gray-400 mt-1 flex items-center justify-end gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(ticket.createdAt), "HH:mm น.", { locale: th })}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
