"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    FileCheck,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Eye,
    Clock,
    AlertCircle,
    Building2,
    ExternalLink,
    Download,
    X,
    ChevronRight,
    Loader2,
    CheckSquare,
    Image as ImageIcon,
    Info,
    Sparkles,
    ShieldCheck,
    ShieldAlert
} from "lucide-react";

export default function ApprovalsPage() {
    const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('Pending');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedApproval, setSelectedApproval] = useState<any>(null);
    const [rejectionTarget, setRejectionTarget] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [approvals, setApprovals] = useState<any[]>([]);

    useEffect(() => {
        fetchApprovals();
    }, []);

    const fetchApprovals = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/approvals");
            if (res.ok) {
                const data = await res.json();
                setApprovals(data);
            } else {
                console.error("Failed to fetch approvals:", res.statusText);
            }
        } catch (err) {
            console.error("Error fetching approvals:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
        try {
            const res = await fetch("/api/admin/approvals", {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, reason })
            });
            if (res.ok) {
                alert(status === 'APPROVED' ? "อนุมัติเรียบร้อยแล้ว" : "ปฏิเสธการอนุมัติแล้ว");
                setSelectedApproval(null); // Close slip viewer if open
                setRejectionTarget(null); // Close rejection modal if open
                setRejectionReason(""); // Clear rejection reason
                fetchApprovals(); // Re-fetch data to update UI
            } else {
                const errorData = await res.json();
                alert(`เกิดข้อผิดพลาด: ${errorData.error || res.statusText}`);
            }
        } catch (err) {
            console.error("Error performing action:", err);
            alert("เกิดข้อผิดพลาดในการดำเนินการ");
        }
    };

    const filteredApprovals = approvals.filter(ap =>
        (activeTab === 'All' ? true : ap.status === activeTab) &&
        (searchQuery ? ap.refId.toLowerCase().includes(searchQuery.toLowerCase()) || ap.tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    );

    const handleApprove = (id: string) => {
        handleAction(id, 'APPROVED');
    };

    const handleReject = () => {
        if (!rejectionReason) return alert("กรุณาระบุเหตุผลในการปฏิเสธ");
        if (!rejectionTarget) return;
        handleAction(rejectionTarget.id, 'REJECTED', rejectionReason);
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
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-black tracking-tight text-gray-900 inline-flex items-center gap-3">
                        <CheckSquare className="h-8 w-8 text-brand-orange" />
                        ตรวจสอบสลิปการโอนเงิน (Approvals)
                    </motion.h1>
                    <motion.p variants={itemVariants} className="mt-1 text-sm font-medium text-gray-500">
                        ตรวจสอบสลิปการโอนเงินต่ออายุแพ็กเกจ และอนุมัติการใช้งานให้ร้านค้า
                    </motion.p>
                </div>
            </div>

            <motion.div variants={itemVariants} className="rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="ค้นหาเลขอ้างอิง, ชื่อร้าน..." className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-orange-50" />
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
                        {[
                            { id: 'Pending', label: 'รอตรวจสอบ', count: 2 },
                            { id: 'Approved', label: 'อนุมัติแล้ว', count: 124 },
                            { id: 'Rejected', label: 'ถูกปฏิเสธ', count: 5 },
                            { id: 'All', label: 'ทั้งหมด', count: null }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {tab.label} {tab.count !== null && <span className="ml-1 opacity-50">({tab.count})</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Transaction Details</th>
                                <th className="px-6 py-4">Package & Amount</th>
                                <th className="px-6 py-4">Proof of Payment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {approvals.map((ap, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{ap.tenant.name}</p>
                                        <p className="text-gray-500 font-medium text-xs mt-0.5">Ref: {ap.refId} • {new Date(ap.createdAt).toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-700">{ap.plan}</p>
                                        <p className="font-black text-brand-orange mt-0.5">฿ {parseFloat(ap.amount).toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedApproval(ap)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-xs transition-colors hover:bg-emerald-100"
                                        >
                                            <ImageIcon className="h-4 w-4" /> ดูสลิป (โอนจาก {ap.bank})
                                        </button>
                                        {ap.aiAnalysis && (
                                            <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-[10px] w-fit">
                                                <Sparkles className="h-3 w-3" /> AI วิเคราะห์แล้ว
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                             ${ap.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200/50' :
                                                ap.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' :
                                                    'bg-red-50 text-red-600 border border-red-200/50'}
                                         `}>
                                            {ap.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {ap.status === 'Pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(ap.id)}
                                                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95" title="อนุมัติเงิน"
                                                >
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => setRejectionTarget(ap)}
                                                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95" title="ปฏิเสธสลิป"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase">{ap.processedBy} • {ap.processedAt}</p>
                                                {ap.status === 'Rejected' && <p className="text-[10px] font-bold text-red-500 mt-1 italic">Reason: {ap.reason}</p>}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Slip Viewer Modal */}
            <AnimatePresence>
                {selectedApproval && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedApproval(null)}
                            className="absolute inset-0 bg-gray-900/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">{selectedApproval.tenant.name}</h3>
                                        <p className="text-sm font-bold text-gray-500">ยอดโอน: <span className="text-brand-orange">฿ {parseFloat(selectedApproval.amount).toLocaleString()}</span> • {selectedApproval.bank}</p>
                                    </div>
                                    <button onClick={() => setSelectedApproval(null)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                        <X className="h-6 w-6 text-gray-400" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
                                    <div className="rounded-3xl bg-gray-100 overflow-hidden relative group h-full flex items-center justify-center">
                                        {selectedApproval.slipUrl ? (
                                            <img
                                                src={selectedApproval.slipUrl}
                                                alt="Slip"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x800?text=Image+Load+Failed';
                                                }}
                                            />
                                        ) : (
                                            <div className="text-center p-8">
                                                <div className="h-16 w-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Info className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-500">ไม่พบรูปภาพหลักฐาน <br /> (Missing or Invalid URL)</p>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black text-gray-900 flex items-center gap-2">
                                            <Info className="h-3 w-3" /> แตะเพื่อซูม
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100">
                                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Sparkles className="h-3 w-3" /> AI Analysis Insight
                                            </h4>

                                            {selectedApproval.aiAnalysis ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-gray-500">ยอดเงินที่อ่านได้:</span>
                                                        <div className="text-right">
                                                            <p className={`text-xl font-black ${Math.abs(parseFloat(selectedApproval.aiAnalysis.amount) - parseFloat(selectedApproval.amount)) < 1
                                                                ? 'text-emerald-600' : 'text-red-500'
                                                                }`}>
                                                                ฿ {parseFloat(selectedApproval.aiAnalysis.amount).toLocaleString()}
                                                            </p>
                                                            {Math.abs(parseFloat(selectedApproval.aiAnalysis.amount) - parseFloat(selectedApproval.amount)) >= 1 && (
                                                                <p className="text-[10px] font-bold text-red-400 mt-1 italic">
                                                                    ไม่ตรงกับยอดที่แจ้ง (฿ {parseFloat(selectedApproval.amount).toLocaleString()})
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-gray-500">วัน/เวลา:</span>
                                                        <p className="text-sm font-black text-gray-900">
                                                            {selectedApproval.aiAnalysis.date} {selectedApproval.aiAnalysis.time}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-gray-500">ธนาคารต้นทาง:</span>
                                                        <p className="text-sm font-black text-gray-900">{selectedApproval.aiAnalysis.bank}</p>
                                                    </div>

                                                    <div className={`p-3 rounded-xl flex items-center gap-3 ${selectedApproval.aiAnalysis.isSlip ? 'bg-emerald-100/50 text-emerald-700' : 'bg-red-100/50 text-red-700'}`}>
                                                        {selectedApproval.aiAnalysis.isSlip ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                                                        <span className="text-xs font-black">
                                                            {selectedApproval.aiAnalysis.isSlip ? 'ยืนยันว่าเป็นสลิปธนาคารจริง' : 'คำเตือน: อาจไม่ใช่รูปสลิปธนาคาร'}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2">
                                                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 mb-1">
                                                            <span>ความแม่นยำ (Confidence)</span>
                                                            <span>{Math.round(selectedApproval.aiAnalysis.confidence * 100)}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all ${selectedApproval.aiAnalysis.confidence > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                                style={{ width: `${selectedApproval.aiAnalysis.confidence * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <Loader2 className="h-8 w-8 text-indigo-300 animate-spin mb-4" />
                                                    <p className="text-sm font-bold text-gray-400">ยังไม่มีข้อมูลการวิเคราะห์<br />หรือระบบกำลังประมวลผล...</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">ข้อมูลผู้สมัคร</p>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-lg shadow-sm">🏪</div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{selectedApproval.tenant.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-500">Plan: {selectedApproval.plan}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setSelectedApproval(null)}
                                        className="flex-1 rounded-2xl border border-gray-200 py-4 text-sm font-black text-gray-500 hover:bg-gray-50 transition-all"
                                    >
                                        ปิดหน้าต่าง
                                    </button>
                                    {selectedApproval.status === 'Pending' && (
                                        <div className="flex-2 flex gap-4">
                                            <button
                                                onClick={() => setRejectionTarget(selectedApproval)}
                                                className="flex-1 rounded-2xl bg-red-50 py-4 text-sm font-black text-red-600 hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100"
                                            >
                                                <XCircle className="h-5 w-5" /> ปฏิเสธสลิป
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleApprove(selectedApproval.id);
                                                    setSelectedApproval(null);
                                                }}
                                                className="flex-1 rounded-2xl bg-brand-orange py-4 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 className="h-5 w-5" /> อนุมัติทันที
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rejection Modal */}
            <AnimatePresence>
                {rejectionTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRejectionTarget(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">ระบุเหตุผลที่ปฏิเสธ</h3>
                                        <p className="text-sm font-bold text-gray-500">Ref: {rejectionTarget.id}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs font-black uppercase text-gray-400 ml-1">เลือกเหตุผลด่วน</p>
                                    <div className="flex flex-wrap gap-2">
                                        {["สลิปไม่ชัดเจน", "ยอดเงินไม่ตรง", "สลิปซ้ำ", "ไม่ใช่สลิปการโอน"].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setRejectionReason(r)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rejectionReason === r ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        placeholder="ระบุเหตุผลอื่นๆ..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full h-32 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-200 focus:bg-white transition-all"
                                    ></textarea>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setRejectionTarget(null)}
                                        className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                    >
                                        ยืนยันการปฏิเสธ
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
