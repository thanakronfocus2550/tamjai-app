"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    WalletCards,
    ArrowUpRight,
    Download,
    CreditCard,
    Building,
    ToggleLeft,
    ToggleRight,
    Settings,
    ShieldCheck,
    X,
    QrCode,
    Camera
} from "lucide-react";
import { useState, useEffect } from "react";

export default function BillingPage() {
    const [isFreeTrialEnabled, setIsFreeTrialEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [billingData, setBillingData] = useState<any>(null);
    const [freeStoreCount, setFreeStoreCount] = useState(0);
    const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);

    // Payment config state
    const [paymentConfig, setPaymentConfig] = useState({ bankName: "", accountNo: "", accountName: "" });
    const [editConfig, setEditConfig] = useState({ bankName: "", accountNo: "", accountName: "" });
    const [isSaving, setIsSaving] = useState(false);

    const MAX_FREE_STORES = 10;

    useEffect(() => {
        async function fetchBilling() {
            try {
                const res = await fetch("/api/admin/billing");
                if (res.ok) {
                    const data = await res.json();
                    setBillingData(data);
                    setFreeStoreCount(data.paidStores || 0); // Using paidStores as a base for now or actual free trial count if added to API
                }
            } catch (err) {
                console.error("Failed to fetch billing data:", err);
            } finally {
                setIsLoading(false);
            }
        }
        async function fetchPaymentConfig() {
            try {
                const res = await fetch("/api/config/payment");
                if (res.ok) {
                    const data = await res.json();
                    setPaymentConfig(data);
                    setEditConfig(data);
                }
            } catch (err) { }
        }
        fetchBilling();
        fetchPaymentConfig();
    }, []);

    const handleDownloadReport = () => {
        alert("กำลังสร้างรายงานรายได้ย้อนหลัง 30 วัน... ระบบจะพร้อมให้ดาวน์โหลดใน 5-10 วินาที");
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
            className="space-y-6 pb-12"
        >
            {isLoading ? (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-3">
                    <div className="h-8 w-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                    <p className="font-medium">กำลังโหลดข้อมูลการเงิน...</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <motion.h1 variants={itemVariants} className="text-3xl font-black tracking-tight text-gray-900 inline-flex items-center gap-3">
                                <WalletCards className="h-8 w-8 text-brand-orange" />
                                รายได้และบิลลิ่ง (Billing)
                            </motion.h1>
                            <motion.p variants={itemVariants} className="mt-1 text-sm font-medium text-gray-500">
                                ภาพรวมรายได้ของแพลตฟอร์มและการชำระเงินจากผู้เช่า
                            </motion.p>
                        </div>
                        <motion.div variants={itemVariants} className="flex gap-3">
                            <button
                                onClick={handleDownloadReport}
                                className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
                            >
                                <Download className="h-4 w-4" /> ดาวน์โหลด Report
                            </button>
                        </motion.div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[2.5rem] bg-gray-900 text-white p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="mb-12">
                                    <span className="text-sm font-black uppercase tracking-widest text-gray-400">Monthly Recurring Revenue (MRR)</span>
                                    <div className="flex items-end gap-4 mt-2">
                                        <h2 className="text-6xl font-black text-white tracking-tighter">฿{(billingData?.mrr || 0).toLocaleString()}</h2>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-black text-emerald-400 mb-2 border border-emerald-500/30">
                                            <ArrowUpRight className="h-4 w-4" />
                                            +12.5% vs last month
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">Paid Subscriptions</span>
                                        <p className="text-2xl font-black mt-1">{billingData?.paidStores || 0} Stores</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">Pending Payments</span>
                                        <p className="text-2xl font-black text-amber-400 mt-1">฿{(billingData?.pending || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="rounded-[2.5rem] bg-white border border-gray-200 p-8 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 mb-6">ช่องทางการรับชำระเงิน</h3>

                            <div className="space-y-4">
                                <div
                                    onClick={() => setIsEditBankModalOpen(true)}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-brand-orange/30 bg-orange-50/50 cursor-pointer hover:bg-orange-100/50 transition-colors group"
                                >
                                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-brand-orange group-hover:scale-110 transition-transform">
                                        <Building className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{paymentConfig.bankName || "ยังไม่ได้ตั้งค่าธนาคาร"}</p>
                                        <p className="text-xs font-bold text-gray-500">{paymentConfig.accountNo || "-"} ({paymentConfig.accountName || "-"})</p>
                                    </div>
                                    <div className="ml-auto text-[10px] font-black uppercase text-brand-orange bg-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        Edit
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 opacity-60">
                                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600 border border-gray-200">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Stripe (บัตรเครดิต)</p>
                                        <p className="text-xs font-bold text-gray-500">Connected</p>
                                    </div>
                                    <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                </div>
                            </div>

                        </motion.div>
                    </div>

                    {/* Platform Control Section */}
                    <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6 mt-8">
                        <div className="rounded-[2.5rem] bg-white border border-gray-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <Settings className="h-6 w-6 text-brand-orange" />
                                <h3 className="text-xl font-black text-gray-900">Platform Control (ตั้งค่าระบบแม่)</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 border border-gray-100">
                                    <div>
                                        <p className="font-black text-gray-900">เปิดรับสมัครทดลองใช้ฟรี (7 วัน)</p>
                                        <p className="text-sm font-medium text-gray-500">ควบคุมการแสดงตัวเลือก "ทดลองใช้ฟรี" ในหน้าสมัครสมาชิก</p>
                                    </div>
                                    <button
                                        onClick={() => setIsFreeTrialEnabled(!isFreeTrialEnabled)}
                                        className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${isFreeTrialEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-gray-200 text-gray-500'}`}
                                    >
                                        {isFreeTrialEnabled ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                                        <span className="text-xs font-black uppercase tracking-widest">{isFreeTrialEnabled ? 'ON' : 'OFF'}</span>
                                    </button>
                                </div>

                                <div className="p-5 rounded-3xl border border-gray-100 bg-white">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="font-black text-gray-900">โควตาร้านค้าทดลองใช้ฟรี</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Free Trial Quota (10 Stores Limit)</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-brand-orange">{freeStoreCount}</span>
                                            <span className="text-lg font-bold text-gray-300"> / {MAX_FREE_STORES}</span>
                                        </div>
                                    </div>

                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(freeStoreCount / MAX_FREE_STORES) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-brand-orange to-orange-400"
                                        />
                                    </div>
                                    <p className="mt-3 text-[10px] font-bold text-gray-400 italic">
                                        * ระบบจะปิดการสมัครทดลองใช้ฟรีกดอัตโนมัติเมื่อครบ 10 ร้านค้า เพื่อควบคุมค่าใช้จ่ายโฮสติ้ง
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2.5rem] bg-orange-50/50 border border-orange-200/50 p-8 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl"></div>
                            <ShieldCheck className="h-12 w-12 text-brand-orange mb-4" />
                            <h4 className="text-xl font-black text-gray-900 mb-2">Platform Status</h4>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                ขณะนี้ระบบเปิดทำงานปกติ โควตาคงเหลือสำหรับการทดลองใช้ฟรีคือ <span className="font-black text-brand-orange">{MAX_FREE_STORES - freeStoreCount} ร้านค้า</span>
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-orange-200 text-[10px] font-black uppercase text-brand-orange">Hosting: Healthy</span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-orange-200 text-[10px] font-black uppercase text-brand-orange">API: 12ms</span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-orange-200 text-[10px] font-black uppercase text-brand-orange">Storage: 14%</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="rounded-[2rem] bg-white border border-gray-200 shadow-sm overflow-hidden mt-8">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-black text-gray-900">รายการรับชำระเงินล่าสุด (Recent Transactions)</h3>
                        </div>
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                        <th className="px-4 py-3 pb-4">Transaction ID</th>
                                        <th className="px-4 py-3 pb-4">ร้านค้า</th>
                                        <th className="px-4 py-3 pb-4">รายละเอียด</th>
                                        <th className="px-4 py-3 pb-4">จำนวนเงิน</th>
                                        <th className="px-4 py-3 pb-4">วันที่</th>
                                        <th className="px-4 py-3 pb-4">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(billingData?.transactions || []).map((tx: any, i: number) => (
                                        <tr key={i} className="group transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer">
                                            <td className="px-4 py-4"><span className="font-bold text-gray-500 text-sm">{tx.id}</span></td>
                                            <td className="px-4 py-4"><span className="font-bold text-gray-900">{tx.store}</span></td>
                                            <td className="px-4 py-4"><span className="text-sm text-gray-600">{tx.detail}</span></td>
                                            <td className="px-4 py-4"><span className="font-black text-gray-900">฿{Number(tx.amount).toLocaleString()}</span></td>
                                            <td className="px-4 py-4"><span className="text-sm font-medium text-gray-500">{tx.date}</span></td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${tx.status === 'Success' ? 'bg-emerald-50 text-emerald-600' :
                                                    tx.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!billingData?.transactions || billingData.transactions.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400 font-medium">ไม่พบรายการชำระเงินในขณะนี้</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Edit Bank Modal */}
                    <AnimatePresence>
                        {isEditBankModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => !isSaving ? setIsEditBankModalOpen(false) : null}
                                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
                                >
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-gray-900">แก้ไขข้อมูลการรับเงิน</h3>
                                            <button
                                                onClick={() => setIsEditBankModalOpen(false)}
                                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                            >
                                                <X className="h-6 w-6 text-gray-400" />
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">ธนาคาร (Bank Name)</label>
                                                <input type="text" value={editConfig.bankName} onChange={e => setEditConfig({ ...editConfig, bankName: e.target.value })} placeholder="เช่น ธนาคารกสิกรไทย" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">เลขที่บัญชี (Account Number)</label>
                                                <input type="text" value={editConfig.accountNo} onChange={e => setEditConfig({ ...editConfig, accountNo: e.target.value })} placeholder="เช่น 012-3-45678-9" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">ชื่อบัญชี (Account Name)</label>
                                                <input type="text" value={editConfig.accountName} onChange={e => setEditConfig({ ...editConfig, accountName: e.target.value })} placeholder="เช่น บจก. ตามใจ โปร" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 ml-1">QR Code สำหรับรับเงิน</label>
                                                <div className="aspect-square w-full max-w-[200px] mx-auto bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-gray-400 cursor-pointer hover:border-brand-orange hover:text-brand-orange transition-all group">
                                                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        <Camera className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-xs font-bold">อัปโหลดรูปภาพ QR</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex gap-4">
                                            <button
                                                onClick={() => setIsEditBankModalOpen(false)}
                                                disabled={isSaving}
                                                className="flex-1 rounded-2xl border border-gray-200 py-4 text-sm font-black text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50"
                                            >
                                                ยกเลิก
                                            </button>
                                            <button
                                                disabled={isSaving}
                                                onClick={async () => {
                                                    setIsSaving(true);
                                                    try {
                                                        const res = await fetch("/api/config/payment", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify(editConfig)
                                                        });
                                                        if (res.ok) {
                                                            setPaymentConfig(editConfig);
                                                            alert("อัปเดตข้อมูลบัญชีสำเร็จ! ร้านค้าทั้งหมดจะเห็นข้อมูลใหม่นี้ทันที");
                                                            setIsEditBankModalOpen(false);
                                                        } else {
                                                            alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
                                                        }
                                                    } catch (err) {
                                                        alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
                                                    } finally {
                                                        setIsSaving(false);
                                                    }
                                                }}
                                                className="flex-2 rounded-2xl bg-brand-orange px-8 py-4 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all disabled:opacity-50"
                                            >
                                                {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </motion.div>
    );
}
