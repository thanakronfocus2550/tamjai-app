"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { CreditCard, AlertTriangle, CheckCircle2, MoreVertical, Search, Filter, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function SubscriptionsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ activeShops: 0, expiringShops: 0, mrr: 0 });
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/subscriptions");
            if (res.ok) {
                const data = await res.json();
                setAllSubscriptions(data.subscriptions);
                setStats(data.stats);
            }
        } catch (err) {
            console.error("Failed to fetch subscriptions:", err);
        } finally {
            setLoading(false);
        }
    };

    const subscriptions = allSubscriptions.filter(s =>
        s.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAction = (id: string, action: string) => {
        alert(`${action} สำหรับบิล ${id} กำลังดำเนินการ...`);
    };

    const handleFilter = () => {
        alert("กรองตามสถานะ (Active/Expired) และประเภทแพ็กเกจ (Pro/Trial) เร็วๆ นี้");
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-3">
                <div className="h-8 w-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                <p className="font-medium">กำลังโหลดข้อมูลระบบ...</p>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">การจัดการแพ็กเกจ</h1>
                    <p className="text-gray-500 font-medium mt-1">ตรวจสอบสถานะการชำระเงิน และต่ออายุแพ็กเกจของร้านค้าทั้งหมด</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleFilter}
                        className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Filter className="h-4 w-4" /> กรองข้อมูล
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5 relative overflow-hidden">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Active Subscriptions</p>
                        <p className="text-3xl font-black text-gray-900">{stats.activeShops} <span className="text-sm font-bold text-gray-400 ml-1">ร้าน</span></p>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5 relative overflow-hidden">
                    <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Expiring in 7 Days</p>
                        <p className="text-3xl font-black text-gray-900">{stats.expiringShops} <span className="text-sm font-bold text-gray-400 ml-1">ร้าน</span></p>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-5 relative overflow-hidden">
                    <div className="h-14 w-14 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">MRR (Monthly Recurring)</p>
                        <p className="text-3xl font-black text-gray-900">{(stats.mrr / 1000).toFixed(1)}K <span className="text-sm font-bold text-gray-400 ml-1">บาท</span></p>
                    </div>
                </motion.div>
            </div>

            {/* Main Table Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                    <h2 className="text-lg font-black text-gray-900">รายการแพ็กเกจทั้งหมด</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อร้าน, รหัสบิล..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-50 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Store & Owner</th>
                                <th className="px-6 py-4">Package</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Expiry Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subscriptions.map((sub, i) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{sub.store}</p>
                                        <p className="text-gray-500 font-medium text-xs mt-0.5">{sub.owner} • {sub.id}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-xs">
                                            {sub.plan}
                                        </span>
                                        {sub.price > 0 && <span className="text-gray-400 font-bold text-xs ml-2">฿{sub.price}/mo</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                         ${sub.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                                                sub.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-red-50 text-red-600'}
                     `}>
                                            {sub.status === 'Active' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                                            {sub.status === 'Expiring Soon' && <AlertTriangle className="h-3 w-3" />}
                                            {sub.status === 'Expired' && <CheckCircle2 className="h-3 w-3" />}
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className={`font-bold ${sub.daysLeft < 0 ? 'text-red-600' : sub.daysLeft <= 7 ? 'text-amber-600' : 'text-gray-900'}`}>{sub.expires}</p>
                                        <p className="text-gray-400 font-medium text-xs mt-0.5">
                                            {sub.daysLeft > 0 ? `เหลืออีก ${sub.daysLeft} วัน` : sub.daysLeft === 0 ? 'หมดอายุวันนี้' : `เลยกำหนด ${Math.abs(sub.daysLeft)} วัน`}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleAction(sub.id, "Manage")}
                                            className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-orange hover:border-brand-orange transition-colors ml-auto"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Dummy */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <span className="text-sm font-bold text-gray-400">Showing {subscriptions.length} of {allSubscriptions.length} entries</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold transition-all ${currentPage === 1 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                            disabled={currentPage === 1}
                        >
                            <ArrowLeft className="h-3 w-3 inline mr-1" /> Prev
                        </button>
                        {[1, 2, 3].map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-brand-orange text-white shadow-sm shadow-orange-200' : 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
                        >
                            Next <ArrowRight className="h-3 w-3 inline ml-1" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
