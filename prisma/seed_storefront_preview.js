const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenants = await prisma.tenant.findMany({ take: 1 });
    if (tenants.length === 0) {
        console.log("No tenants found to seed.");
        return;
    }

    const tenant = tenants[0];
    console.log(`Updating tenant: ${tenant.slug}`);

    await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
            bannerUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
            description: "ร้านอาหารไทยต้นตำรับ รสชาติจัดจ้านถึงใจ บรรยากาศอบอุ่นเหมือนทานที่บ้าน ✨",
        }
    });

    const products = await prisma.product.findMany({
        where: { tenantId: tenant.id },
        take: 3
    });

    for (const p of products) {
        await prisma.product.update({
            where: { id: p.id },
            data: { isRecommended: true }
        });
    }

    console.log("Seed for storefront premium optimization completed!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
