"use client";

import React, { useState, useEffect, use } from "react";
import { ChevronLeft, Printer, QrCode, Download, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function QRManagementPage({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = use(params);
    const [tables, setTables] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setBaseUrl(window.location.origin);
        }

        async function fetchTables() {
            try {
                const res = await fetch(`/api/menu/${shop_slug}/tables`);
                const data = await res.json();
                setTables(data);
            } catch (err) {
                console.error("Failed to fetch tables", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTables();
    }, [shop_slug]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
            {/* Header - Hidden on Print */}
            <div className="max-w-6xl mx-auto mb-10 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href={`/menu/${shop_slug}/admin`} className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors uppercase tracking-widest mb-4">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Table QR System</h1>
                        <p className="text-gray-500 font-medium mt-1">Generate and print unique QR codes for your tables.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all flex items-center gap-2"
                        >
                            <Printer className="h-4 w-4" /> Print All QRs
                        </button>
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                    <div className="h-10 w-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                        <Info className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">How it works?</h3>
                        <p className="text-sm text-blue-700 font-medium mt-1 leading-relaxed">
                            Each table has a unique URL format: <code className="bg-white/50 px-1.5 py-0.5 rounded text-blue-800 font-bold">{baseUrl}/menu/{shop_slug}?table=[No]</code>.
                            When customers scan, they can order directly to their table.
                        </p>
                    </div>
                </div>
            </div>

            {/* QR Grid */}
            <div className="max-w-6xl mx-auto">
                {tables.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-200 print:hidden">
                        <div className="h-20 w-20 bg-gray-50 text-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <QrCode className="h-10 w-10" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">No tables found</h2>
                        <p className="text-gray-500 mt-2">Go to POS system to initialize tables first.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 print:block">
                        {tables.map((table) => {
                            const qrUrl = `${baseUrl}/menu/${shop_slug}?table=${table.number}`;
                            const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrUrl)}`;

                            return (
                                <div key={table.id} className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl hover:border-orange-200 transition-all print:shadow-none print:border print:mb-10 print:break-inside-avoid">
                                    <div className="mb-6">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">SCAN TO ORDER</p>
                                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">TABLE {table.number}</h2>
                                    </div>

                                    <div className="relative mb-8 p-6 bg-white border-4 border-gray-50 rounded-[3rem] group-hover:border-orange-50 transition-colors">
                                        <img src={qrImage} alt={`Table ${table.number} QR`} className="h-56 w-56" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] rounded-[3rem] print:hidden">
                                            <a
                                                href={qrImage}
                                                download={`Table-${table.number}-QR.png`}
                                                className="h-12 w-12 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                                            >
                                                <Download className="h-5 w-5" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{shop_slug.toUpperCase()}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest underline decoration-orange-500/30 underline-offset-4">{qrUrl}</p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-50 w-full flex items-center justify-center gap-2 print:hidden">
                                        <Info className="h-3 w-3 text-gray-300" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PRO POWERED BY TAMJAI</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}
