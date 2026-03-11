"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Palette, CheckCircle2, RefreshCw, Save, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSettingsPage({ params }: { params: Promise<{ shop_slug: string }> }) {
    const { shop_slug } = React.use(params);
    const { data: session } = useSession();
    const router = useRouter();

    const [themeColor, setThemeColor] = useState("#FF6B00");
    const [logoUrl, setLogoUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Initial load of the existing tenant configuration
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`/api/menu/${shop_slug}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setThemeColor(data.themeColor || "#FF6B00");
                    setLogoUrl(data.logoUrl || "");
                }
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load settings:", err);
                setIsLoading(false);
            }
        };

        if (session) {
            fetchConfig();
        }
    }, [session, shop_slug]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch(`/api/menu/${shop_slug}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeColor, logoUrl }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to update theme");
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const presetColors = [
        "#FF6B00", // Brand Orange
        "#2563EB", // Blue
        "#16A34A", // Green
        "#DC2626", // Red
        "#9333EA", // Purple
        "#DB2777", // Pink
        "#000000", // Black
    ];

    if (isLoading) {
        return <div className="p-8 flex items-center justify-center min-h-[400px]">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <Palette className="h-6 w-6 text-brand-orange" />
                    ตั้งค่าธีมร้านค้า (Theme)
                </h1>
                <p className="text-gray-500">ปรับแต่งสีโลโก้และธีมของร้านค้าให้เข้ากับแบรนด์ของคุณ</p>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-10">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center justify-center">
                        {error}
                    </div>
                )}

                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-bold flex items-center gap-2 justify-center"
                        >
                            <CheckCircle2 className="h-5 w-5" /> บันทึกการตั้งค่าธีมเรียบร้อยแล้ว
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Color Selection */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-orange-50 text-brand-orange flex items-center justify-center text-sm">1</span>
                        สีหลักของร้าน (Primary Color)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:pl-10">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700">เลือกสีของคุณ:</label>
                            <div className="flex flex-wrap gap-3">
                                {presetColors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setThemeColor(color)}
                                        className={`w-12 h-12 rounded-full border-4 transition-all ${themeColor === color ? "border-brand-orange scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            <div className="pt-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">หรือระบุรหัสสี (Hex Code):</label>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-10 w-10 rounded-lg shadow-inner border border-gray-200"
                                        style={{ backgroundColor: themeColor }}
                                    />
                                    <input
                                        type="text"
                                        value={themeColor}
                                        onChange={(e) => setThemeColor(e.target.value)}
                                        className="flex-1 max-w-[150px] border border-gray-200 rounded-xl px-4 py-2 font-mono outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange uppercase"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center gap-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">ตัวอย่างปุ่มพรีวิว</h4>
                            <button
                                type="button"
                                className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: themeColor, boxShadow: `0 10px 25px ${themeColor}40` }}
                            >
                                สั่งอาหารเลย
                            </button>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-bold" style={{ color: themeColor }}>ข้อความสีหลัก</span>
                                <span className="px-3 py-1 rounded-md text-xs font-bold" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>พื้นหลังอ่อน</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Logo Upload */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-orange-50 text-brand-orange flex items-center justify-center text-sm">2</span>
                        โลโก้ร้านค้า (Store Logo)
                    </h3>

                    <div className="md:pl-10 space-y-4">
                        <label className="block text-sm font-bold text-gray-700">URL รูปภาพโลโก้ (รองรับ PNG, JPG, WebP)</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="url"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://example.com/my-logo.png"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">เพิ่ม URL รูปภาพโดยตรง หากไม่มีระบบจะแสดงเป็นชื่อร้านแทน</p>

                        {logoUrl && (
                            <div className="mt-4 p-4 border border-gray-100 bg-gray-50 rounded-xl inline-block">
                                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">ภาพพรีวิวโลโก้</p>
                                <img src={logoUrl} alt="Store Logo Preview" className="h-16 w-auto object-contain rounded-md" onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text fill="%239ca3af" x="50" y="50" font-family="sans-serif" font-size="12" text-anchor="middle" dominant-baseline="middle">Invalid URL</text></svg>';
                                }} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-gray-200 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {isSaving ? <><RefreshCw className="h-4 w-4 animate-spin" /> กำลังบันทึก...</> : <><Save className="h-4 w-4" /> บันทึกการตั้งค่า</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
