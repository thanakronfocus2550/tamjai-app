const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.log("No tenant found. Please create a shop first.");
        return;
    }

    console.log(`Found tenant: ${tenant.name} (${tenant.id})`);

    const approvals = [
        {
            refId: "PAY-001",
            tenantId: tenant.id,
            plan: "Tamjai Pro (1 Month)",
            amount: 450,
            bank: "K-Bank",
            status: "PENDING",
            slipUrl: "https://placehold.co/400x600/orange/white?text=K-Bank+Slip+450"
        },
        {
            refId: "PAY-002",
            tenantId: tenant.id,
            plan: "Tamjai Pro (Annual)",
            amount: 4500,
            bank: "SCB",
            status: "PENDING",
            slipUrl: "https://placehold.co/400x600/purple/white?text=SCB+Slip+4500"
        }
    ];

    for (const app of approvals) {
        try {
            await prisma.paymentApproval.upsert({
                where: { refId: app.refId },
                update: app,
                create: app
            });
            console.log(`Seeded approval: ${app.refId}`);
        } catch (e) {
            console.error(`Error seeding ${app.refId}:`, e.message);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
