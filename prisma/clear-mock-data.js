const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Clearing Mock Data ---');

    try {
        // 1. Clear Payment Approvals
        const approvals = await prisma.paymentApproval.deleteMany({});
        console.log(`Deleted ${approvals.count} Payment Approvals`);

        // 2. Clear Mascot Tickets (Helpdesk)
        const mascotTickets = await prisma.mascotTicket.deleteMany({});
        console.log(`Deleted ${mascotTickets.count} Mascot Tickets`);

        // 2.1 Clear Helpdesk Tickets (Tenant specific)
        const helpdeskTickets = await prisma.helpdeskTicket.deleteMany({});
        console.log(`Deleted ${helpdeskTickets.count} Helpdesk Tickets`);

        // 3. Clear Orders
        const orders = await prisma.order.deleteMany({});
        console.log(`Deleted ${orders.count} Orders`);

        // Note: We keep Tenants and Users (especially Superadmin)

        console.log('--- Initialization Complete: Stats are now 0 ---');
    } catch (error) {
        console.error('Error clearing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
