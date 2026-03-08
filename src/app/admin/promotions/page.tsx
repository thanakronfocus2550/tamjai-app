"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Plus,
    Search,
    Filter,
    Trash2,
    Copy,
    Calendar,
    Users,
    Percent,
    ChevronRight,
    X,
    CheckCircle2,
    Info,
    AlertCircle,
    Tag,
    Clock,
    MoreVertical
} from "lucide-react";

export default function PromotionsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [coupons, setCoupons] = useState<any[]>([]);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/admin/promotions");
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("คุณต้องการลบคูปองนี้ใช่หรือไม่?")) {
            try {
                const res = await fetch(`/api/admin/promotions?id=${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    fetchCoupons();
                }
            } catch (err) {
                alert("เกิดข้อผิดพลาดในการลบ");
            }
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

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        alert(`คัดลอกรหัส ${code} สำเร็จ!`);
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <motion.h2 variants={itemVariants} className="text-3xl font-black text-gray-900 tracking-tight">
                        จัดการคูปอง & ส่วนลด
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-gray-500 font-medium mt-1">
                        สร้างและจัดการรหัสส่วนลดสำหรับแพ็กเกจ Tamjai Pro
                    </motion.p>
                </div>
                <motion.div variants={itemVariants}>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 text-sm font-black text-white shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        <Plus className="h-5 w-5" /> สร้างคูปองใหม่
                    </button>
                </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: "คูปองที่ใช้งานอยู่", value: "3 รหัส", icon: Tag, color: "text-brand-orange", bg: "bg-orange-50" },
                    { label: "จำนวนการใช้งานรวม", value: "243 ครั้ง", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "ส่วนลดรวมที่มอบให้", value: "฿ 12,450", icon: Percent, color: "text-emerald-600", bg: "bg-emerald-50" }
                ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-black text-gray-900 mt-0.5">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Table Controls */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยรหัสคูปอง..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-[1.5rem] border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm font-bold text-gray-900 outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-50 transition-all"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 rounded-[1.5rem] bg-white border border-gray-200 px-6 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                    <Filter className="h-5 w-5" /> ตัวกรอง
                </button>
            </motion.div>

            {/* Coupons Table */}
            <motion.div variants={itemVariants} className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-xl shadow-gray-100/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-8 py-6">Coupon Detail</th>
                                <th className="px-6 py-6 text-center">Discount</th>
                                <th className="px-6 py-6 text-center">Usage</th>
                                <th className="px-6 py-6">Expiry</th>
                                <th className="px-6 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center font-black">
                                                <Tag className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-gray-900 text-lg">{coupon.code}</span>
                                                    <button onClick={() => handleCopy(coupon.code)} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-gray-300 hover:text-brand-orange transition-all">
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 mt-0.5">Min Purchase: ฿ {parseFloat(coupon.minPurchase).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm">
                                            {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `฿ ${parseFloat(coupon.value).toLocaleString()}`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${coupon.usageLimit && coupon.usageCount / coupon.usageLimit > 0.8 ? 'bg-amber-500' : 'bg-brand-orange'}`}
                                                    style={{ width: coupon.usageLimit ? `${(coupon.usageCount / coupon.usageLimit) * 100}%` : '0%' }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{coupon.usageCount} / {coupon.usageLimit || '∞'} Used</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No expiry'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase
                                            ${coupon.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                                coupon.status === 'WARNING' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-red-50 text-red-600'}
                                        `}>
                                            {coupon.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedCoupon(coupon)}
                                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm"
                                            >
                                                <Info className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-600 transition-all shadow-sm"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add Coupon Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">สร้างคูปองใหม่</h3>
                                            <p className="text-sm font-bold text-gray-400">กำหนดเงื่อนไขและส่วนลดสำหรับร้านค้า</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                        <X className="h-6 w-6 text-gray-400" />
                                    </button>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Coupon Code</label>
                                            <input type="text" placeholder="เช่น SUMMER2024" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-50 focus:bg-white transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Discount Type</label>
                                            <select className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-50 focus:bg-white transition-all">
                                                <option>Percentage (%)</option>
                                                <option>Fixed Amount (฿)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Discount Value</label>
                                            <input type="number" placeholder="0" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-50 focus:bg-white transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Min. Purchase (Option)</label>
                                            <input type="number" placeholder="฿ 0" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-50 focus:bg-white transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Expiry Date</label>
                                            <input type="date" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-50 focus:bg-white transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">Usage Limit</label>
                                            <input type="number" placeholder="ไม่จำกัด" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-50 focus:bg-white transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 rounded-2xl bg-orange-50 border border-orange-100 flex gap-3">
                                    <Info className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold text-orange-800 leading-relaxed">
                                        คูปองนี้จะสามารถใช้ได้กับร้านค้าที่มีการสมัครสมาชิกใหม่ หรือต่ออายุผ่านระบบ Child App เท่านั้น โดยจะนำไปหักลบกับยอดชำระก่อนภาษีมูลค่าเพิ่ม (ถ้ามี)
                                    </p>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 rounded-2xl border border-gray-200 py-4 text-sm font-black text-gray-500 hover:bg-gray-50 transition-all"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={() => {
                                            alert("สร้างคูปองสำเร็จ! ระบบกำลังอัปเดตฐานข้อมูล...");
                                            setIsAddModalOpen(false);
                                        }}
                                        className="flex-2 rounded-2xl bg-brand-orange py-4 text-sm font-black text-white shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        ยืนยันสร้างคูปอง <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick View Modal */}
            <AnimatePresence>
                {selectedCoupon && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCoupon(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl"
                        >
                            <div className="text-center">
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-50 text-emerald-600 mb-6">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900">{selectedCoupon.code}</h3>
                                <p className="text-sm font-bold text-gray-500 mt-2">Active Coupon Data</p>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-600">Total Redeemed</span>
                                    </div>
                                    <span className="font-black text-gray-900">{selectedCoupon.usage} times</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-600">Last Used</span>
                                    </div>
                                    <span className="font-black text-gray-900 text-sm">2 ชม. ที่แล้ว</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-600">Status</span>
                                    </div>
                                    <span className="font-black text-emerald-600 text-sm">{selectedCoupon.status}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedCoupon(null)}
                                className="w-full mt-8 rounded-2xl bg-gray-900 py-4 text-sm font-black text-white hover:bg-gray-800 transition-all"
                            >
                                ตกลง
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
