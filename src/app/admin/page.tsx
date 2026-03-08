"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
    TrendingUp,
    Store,
    Crown,
    Users,
    AlertCircle,
    ArrowUpRight,
    MoreVertical,
    Filter,
    Download,
    CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                    setTenants(data.recentTenants);
                }
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
            } finally {
                setLoading(false);
            }
        }

        async function fetchRevenue() {
            try {
                const res = await fetch("/api/admin/stats/revenue");
                if (res.ok) {
                    const data = await res.json();
                    setRevenueData(data);
                }
            } catch (err) {
                console.error("Failed to fetch revenue trends:", err);
            } finally {
                setIsLoadingTrends(false);
            }
        }

        fetchStats();
        fetchRevenue();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-3">
                <div className="h-8 w-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                <p className="font-medium">กำลังโหลดข้อมูลระบบ...</p>
            </div>
        );
    }

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExportCSV = () => {
        alert("กำลังจัดเตรียมไฟล์ CSV... ระบบจะเริ่มดาวน์โหลดในสักครู่");
    };

    const handleFilter = () => {
        alert("ระบบกรองข้อมูลระดับสูงจะพร้อมใช้งานเร็วๆ นี้");
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-12"
        >
            <div className="flex items-center justify-between">
                <div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-black tracking-tight text-gray-900">ภาพรวมระบบ</motion.h1>
                    <motion.p variants={itemVariants} className="mt-1 text-sm font-medium text-gray-500">ข้อมูลอัปเดตแบบเรียลไทม์ (อัปเดตล่าสุด 1 นาทีที่แล้ว)</motion.p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {[
                    { label: "รายได้รวมระบบ", value: "฿" + (stats?.revenue || 0).toLocaleString(), trend: "+12.5%", color: "text-brand-orange", icon: TrendingUp, bg: "bg-orange-50" },
                    { label: "ร้านค้าทั้งหมด", value: (stats?.tenants || 0) + " ร้าน", trend: "+5 ร้าน", color: "text-gray-900", icon: Store, bg: "bg-gray-100" },
                    { label: "สมาชิก PRO", value: (stats?.proTenants || 0) + " ร้าน", trend: "88% จากทั้งหมด", color: "text-emerald-600", icon: Crown, bg: "bg-emerald-50" },
                    { label: "รหัสโปรโมชั่น", value: (stats?.promoCodes || 0) + " รหัส", trend: "3 รหัสใหม่", color: "text-purple-600", icon: CheckCircle2, bg: "bg-purple-50" },
                    { label: "การใช้งานโปรฯ", value: (stats?.promoUsage || 0).toLocaleString() + " ครั้ง", trend: "รวมทุกร้าน", color: "text-blue-600", icon: ArrowUpRight, bg: "bg-blue-50" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all"
                    >
                        <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${stat.bg} mix-blend-multiply opacity-50 transition-transform group-hover:scale-150 duration-700`}></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} transition-transform group-hover:-rotate-6`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-black uppercase text-gray-500">
                                    <ArrowUpRight className="h-3 w-3" />
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="mb-1 text-xs font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                            <h4 className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</h4>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Revenue Graph Mockup (Animated) */}
                <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[2.5rem] bg-white p-8 border border-gray-100 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-gray-900">แนวโน้มรายได้ (การเติบโต)</h3>
                            <p className="text-sm text-gray-500 font-medium">เปรียบเทียบ 7 เดือนย้อนหลัง</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50">
                                <span className="h-2 w-2 rounded-full bg-brand-orange"></span> PRO Revenue
                            </span>
                        </div>
                    </div>

                    <div className="h-64 w-full flex items-end gap-3 px-2">
                        {isLoadingTrends ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">กำลังโหลดกราฟ...</div>
                        ) : revenueData.length > 0 ? (
                            revenueData.map((d, i) => {
                                const maxVal = Math.max(...revenueData.map(v => v.amount), 1);
                                const heightPercent = (d.amount / maxVal) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative cursor-crosshair">
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                                            ฿{Number(d.amount).toLocaleString()}
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-t-xl relative overflow-hidden transition-colors h-full flex items-end">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercent}%` }}
                                                transition={{ duration: 1, delay: 0.1 + (i * 0.1), type: "spring" }}
                                                className="w-full bg-gradient-to-t from-brand-orange to-orange-400 group-hover:from-orange-500 group-hover:to-orange-300 transition-colors relative"
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-1/2 rounded-tr-full"></div>
                                            </motion.div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-gray-400">{d.month}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">ยังไม่มีข้อมูลยอดขาย</div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Support Management */}
                <motion.div variants={itemVariants} className="rounded-[2.5rem] bg-gray-900 p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-10 -bottom-10 h-64 w-64 bg-orange-500/20 rounded-full blur-[80px]"></div>
                    <div className="absolute top-8 right-8 text-orange-400 opacity-50">
                        <AlertCircle className="h-10 w-10" />
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 mb-6 text-xs font-black text-brand-orange uppercase tracking-widest border border-orange-500/30">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            Urgent Support
                        </div>
                        <h3 className="text-2xl font-black mb-2 tracking-tight line-clamp-2 leading-tight">การแจ้งเตือนจาก<br />ผู้เช่าระบบ</h3>
                        <p className="text-gray-400 text-sm font-medium mb-8">
                            {stats?.notifications?.urgentSupport?.length > 0
                                ? `มี ${stats.notifications.urgentSupport.length} รายการที่ต้องดูแลด่วน`
                                : stats?.notifications?.paymentApprovals > 0
                                    ? `มี ${stats.notifications.paymentApprovals} รายการรอตรวจสลิป`
                                    : "ไม่มีรายการที่ต้องดูแลเป็นพิเศษ"}
                        </p>

                        <div className="space-y-3 mb-8">
                            {(stats?.notifications?.urgentSupport || []).map((req: any, i: number) => (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    key={i}
                                    className="cursor-pointer rounded-2xl bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold truncate pr-3">{req.name}</span>
                                        <span className="text-[10px] bg-brand-orange text-white px-2 py-0.5 rounded-full font-black">{req.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">{req.msg}</p>
                                </motion.div>
                            ))}

                            {stats?.notifications?.paymentApprovals > 0 && (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => router.push('/admin/approvals')}
                                    className="cursor-pointer rounded-2xl bg-orange-500/10 p-4 border border-orange-500/30 hover:bg-orange-500/20 transition-colors backdrop-blur-sm"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-orange-400">💰 รอตรวจสลิปชำระเงิน</span>
                                        <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-black">{stats.notifications.paymentApprovals}</span>
                                    </div>
                                    <p className="text-xs text-orange-300 truncate">มีรายการขอต่ออายุแพ็กเกจรอการอนุมัติ</p>
                                </motion.div>
                            )}

                            {(!stats?.notifications?.urgentSupport || stats.notifications.urgentSupport.length === 0) && stats?.notifications?.paymentApprovals === 0 && (
                                <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-xs font-bold">All clear!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/admin/helpdesk')}
                        className="relative z-10 w-full rounded-2xl bg-white text-gray-900 py-4 font-black transition-all hover:bg-gray-100 flex items-center justify-center gap-2 active:scale-95 shadow-xl"
                    >
                        จัดการข้อร้องเรียน <ArrowUpRight className="h-4 w-4" />
                    </button>
                </motion.div>
            </div>

            {/* Tenant Management Table */}
            <motion.div variants={itemVariants} className="rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div>
                        <h3 className="text-xl font-black tracking-tight text-gray-900">จัดการร้านค้า (Tenants)</h3>
                        <p className="text-sm text-gray-500 font-medium">รายชื่อร้านค้าทั้งหมดที่ลงทะเบียนในระบบ</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ค้นหา..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="rounded-xl border border-gray-200 bg-white py-2 px-4 text-sm font-bold text-gray-600 outline-none focus:border-brand-orange transition-all"
                            />
                        </div>
                        <button
                            onClick={handleFilter}
                            className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Filter className="h-4 w-4" /> กรองข้อมูล
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
                        >
                            <Download className="h-4 w-4" /> ส่งออก CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-3 font-black">ชื่อร้านค้า (Tenant)</th>
                                <th className="px-6 py-3 font-black">แพ็กเกจ</th>
                                <th className="px-6 py-3 font-black">ออเดอร์ (เดือนนี้)</th>
                                <th className="px-6 py-3 font-black">รายได้รวม</th>
                                <th className="px-6 py-3 font-black">สถานะ</th>
                                <th className="px-6 py-3 text-right font-black">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.map((t, i) => (
                                <tr key={i} className="group transition-colors bg-white hover:bg-gray-50 shadow-sm border border-transparent hover:border-gray-200 rounded-2xl">
                                    <td className="px-6 py-4 rounded-l-2xl border-b border-t border-l border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <span className="block font-bold text-gray-900">{t.name}</span>
                                        <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-1">
                                            <Store className="h-3 w-3" /> ID: {t.id}
                                            {t.slug && <span className="text-blue-500 underline ml-2">(tamjai.pro/menu/{t.slug})</span>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 border-b border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase border ${t.package.includes('Pro') ? 'bg-orange-50 text-brand-orange border-orange-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {t.package.includes('Pro') && <Crown className="h-3 w-3" />}
                                            {t.package}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 border-b border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <span className="font-bold text-gray-700">{t.orders} รายการ</span>
                                    </td>
                                    <td className="px-6 py-4 border-b border-t border-gray-100 group-hover:border-gray-200 transition-colors font-black text-gray-900">
                                        {"฿" + (t.revenue || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 border-b border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2.5 w-2.5 rounded-full ${t.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}></span>
                                            <span className={`text-[11px] font-black uppercase ${t.status === 'Active' ? 'text-emerald-700' : 'text-amber-700'}`}>{t.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 rounded-r-2xl text-right border-b border-t border-r border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <button className="p-2 flex items-center justify-center rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-900 transition-all ml-auto focus:outline-none focus:ring-2 focus:ring-brand-orange">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 text-center">
                    <button
                        onClick={() => router.push('/admin/tenants')}
                        className="inline-flex items-center gap-2 text-sm font-black text-brand-orange hover:text-orange-600 transition-colors px-4 py-2 rounded-xl hover:bg-orange-50"
                    >
                        ดูร้านค้าทั้งหมด {stats?.tenants || 0} ร้านค้า <ArrowUpRight className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
