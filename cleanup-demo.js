const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-shop' } });
    if (tenant) {
        await prisma.category.deleteMany({ where: { tenantId: tenant.id } });
        console.log('Deleted categories for demo-shop');
    }
}

main().finally(() => prisma.$disconnect());
