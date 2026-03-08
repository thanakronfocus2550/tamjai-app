import type { Metadata } from "next";

type Props = {
    params: Promise<{ shop_slug: string }>;
};

// Mock function - in production would fetch from DB
function getStoreData(slug: string) {
    return {
        name: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        description: "สั่งอาหารออนไลน์ง่ายๆ ผ่านเว็บ ไม่ต้องโหลดแอป รับออเดอร์ทุกวัน 9:00-17:00",
        address: "กรุงเทพมหานคร",
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { shop_slug } = await params;
    const store = getStoreData(shop_slug);
    return {
        title: `${store.name} — สั่งอาหารออนไลน์`,
        description: `${store.name}: ${store.description}`,
        openGraph: {
            title: `สั่งอาหารออนไลน์ — ${store.name}`,
            description: store.description,
            type: "website",
        },
    };
}

export default async function MenuLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ shop_slug: string }>;
}) {
    await params; // resolve params (used in generateMetadata above)
    return <>{children}</>;
}
