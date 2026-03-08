"use client";

import { use } from "react";

export default function KitchenPrintPage({ params }: { params: Promise<{ shop_slug: string; id: string }> }) {
    const { shop_slug, id } = use(params);
    const storeName = shop_slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const now = new Date().toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });

    return (
        <>
            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-family: 'Courier New', monospace; font-size: 12px; }
        }
        body { background: white; }
      `}</style>

            <div className="no-print fixed top-4 right-4 z-50">
                <button onClick={() => window.print()} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-orange-600">
                    🖨️ พิมพ์ใบสั่งอาหาร
                </button>
            </div>

            <div className="max-w-[320px] mx-auto p-6 font-mono text-sm text-gray-900" style={{ fontFamily: "'Courier New', monospace" }}>
                {/* Header */}
                <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
                    <p className="text-xl font-black">{storeName}</p>
                    <p className="text-xs text-gray-600 mt-1">ใบสั่งอาหาร (Kitchen Copy)</p>
                    <p className="text-xs text-gray-500 mt-0.5">{now}</p>
                </div>

                {/* Order ID */}
                <div className="text-center mb-4">
                    <span className="text-2xl font-black border-2 border-gray-900 px-4 py-1 inline-block">#{id}</span>
                </div>

                <div className="border-b border-dashed border-gray-300 pb-3 mb-3">
                    <p className="font-bold text-xs uppercase mb-2">รายการอาหาร:</p>
                    <div className="space-y-2">
                        <div>
                            <p className="font-bold">1× ตำป่าแซ่บสะดุ้ง</p>
                            <p className="text-xs text-gray-600 ml-3">• เผ็ด: แซ่บมาก</p>
                            <p className="text-xs text-gray-600 ml-3">• เพิ่ม: ไข่ดาว</p>
                            <p className="text-xs text-gray-600 ml-3">• โน้ต: ไม่ใส่ผักชี</p>
                        </div>
                        <div>
                            <p className="font-bold">1× ไก่ย่างวิเชียรบุรี</p>
                            <p className="text-xs text-gray-600 ml-3">• เผ็ด: กลาง</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-1 text-xs border-b border-dashed border-gray-300 pb-3 mb-3">
                    <div className="flex justify-between"><span>ค่าอาหาร</span><span>฿210</span></div>
                    <div className="flex justify-between"><span>ค่าจัดส่ง</span><span>฿30</span></div>
                    <div className="flex justify-between font-black text-base"><span>รวม</span><span>฿240</span></div>
                </div>

                <div className="text-xs space-y-1 text-gray-700">
                    <p><span className="font-bold">ชื่อ:</span> คุณสมชาย ใจดี</p>
                    <p><span className="font-bold">โทร:</span> 081-234-5678</p>
                    <p><span className="font-bold">ที่อยู่:</span> 99/1 ซ.เอกมัย 12 กรุงเทพฯ</p>
                    <p><span className="font-bold">ชำระ:</span> PromptPay (ยังไม่ได้รับ)</p>
                </div>

                <div className="text-center mt-6 border-t border-dashed border-gray-300 pt-4">
                    <p className="text-xs text-gray-500">ขอบคุณที่ใช้บริการ 🙏</p>
                    <p className="text-[10px] text-gray-400 mt-1">Powered by Tamjai Pro</p>
                </div>
            </div>
        </>
    );
}
