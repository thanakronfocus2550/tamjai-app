const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkUser() {
    console.log("Checking for admin@tamjai.pro...");
    const user = await prisma.user.findUnique({
        where: { email: 'admin@tamjai.pro' }
    });

    if (user) {
        console.log("User found:", {
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            posPin: user.posPin
        });

        // Let's reset the password to 'admin' so the user can log in
        const hashedPassword = await bcrypt.hash('admin', 10);
        await prisma.user.update({
            where: { email: 'admin@tamjai.pro' },
            data: { password: hashedPassword }
        });
        console.log("Password has been reset to 'admin' for admin@tamjai.pro");
    } else {
        console.log("User not found. Creating Super Admin...");
        const hashedPassword = await bcrypt.hash('admin', 10);
        await prisma.user.create({
            data: {
                email: 'admin@tamjai.pro',
                name: 'Super Admin',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                posPin: '000000'
            }
        });
        console.log("Created Super Admin: admin@tamjai.pro / admin");
    }
}

checkUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
