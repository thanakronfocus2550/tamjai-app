import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, Clock } from "lucide-react";

type Props = {
    children: React.ReactNode;
    params: Promise<{ shop_slug: string }>;
};

async function getStoreData(slug: string) {
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            isActive: true,
            themeColor: true,
        }
    });
    return tenant;
}

export async function generateMetadata({ params }: { params: Promise<{ shop_slug: string }> }): Promise<Metadata> {
    const { shop_slug } = await params;
    const store = await getStoreData(shop_slug);

    if (!store) {
        return { title: "Shop Not Found — Tamjai Pro" };
    }

    return {
        title: `${store.name} — สั่งอาหารออนไลน์`,
        description: `สั่งอาหารออนไลน์ง่ายๆ จากร้าน ${store.name} ผ่านเว็บ ไม่ต้องโหลดแอป`,
        openGraph: {
            title: `สั่งอาหารออนไลน์ — ${store.name}`,
            description: `สั่งอาหารออนไลน์ง่ายๆ จากร้าน ${store.name} ผ่านเว็บ ไม่ต้องโหลดแอป`,
            type: "website",
        },
    };
}

export default async function MenuLayout({
    children,
    params,
}: Props) {
    const { shop_slug } = await params;
    const store = await getStoreData(shop_slug);

    if (!store) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-gray-900 mb-2">ไม่พบร้านค้า</h1>
                    <p className="text-gray-500 font-medium">กรุณาตรวจสอบ URL อีกครั้ง</p>
                </div>
            </div>
        );
    }

    if (!store.isActive) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6">
                <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center">
                    <div className="h-20 w-20 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <AlertTriangle className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">หน้าร้านปิดปรับปรุงชั่วคราว</h2>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
                        ขออภัยในความไม่สะดวก ร้านค้า {store.name} กำลังอัปเดตระบบ หรืออยู่ระหว่างการต่ออายุแพ็กเกจ กรุณาลองใหม่อีกครั้งในภายหลัง
                    </p>
                    <div className="space-y-3">
                        <a
                            href={`/menu/${shop_slug}`}
                            className="block w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all text-center"
                        >
                            ลองโหลดใหม่อีกครั้ง
                        </a>
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock className="h-3 w-3" /> Powered by Tamjai Pro
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `:root { --store-primary: ${store.themeColor}; }` }} />
            {children}
        </>
    );
}
