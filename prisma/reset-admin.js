const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@tamjai.pro';
    const password = 'admin'; // ยืนยันรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Setting up Super Admin: ${email}`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'SUPER_ADMIN',
            },
            create: {
                email,
                name: 'Super Admin',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
            },
        });
        console.log('Successfully updated/created Super Admin!');
        console.log('Email:', email);
        console.log('Password: admin');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
