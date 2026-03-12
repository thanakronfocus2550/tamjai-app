const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const tenant = await prisma.tenant.update({
            where: { slug: 'demo-shop' },
            data: { plan: 'POS' }
        });
        console.log('✅ Updated demo-shop to POS plan:', tenant.name);
    } catch (error) {
        console.error('❌ Error updating tenant:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
