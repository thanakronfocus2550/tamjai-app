const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding demo-shop and demo-admin...");

    try {
        // 1. Create Tenant
        console.log("Creating/Updating Tenant...");
        const tenant = await prisma.tenant.upsert({
            where: { slug: 'demo-shop' },
            update: {},
            create: {
                name: 'ร้านอาหารตัวอย่าง (Demo Shop)',
                slug: 'demo-shop',
                description: 'ระบบร้านอาหารออนไลน์ Tamjai Pro - ตัวอย่างหน้าร้านสำหรับทดสอบฟีเจอร์ต่างๆ',
                themeColor: '#FF6B00',
                bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
                openTime: '08:00',
                closeTime: '22:00',
                isActive: true,
                isOpen: true,
            },
        });
        console.log(`Tenant: ${tenant.slug} (${tenant.id})`);

        // 2. Create Demo Admin User
        console.log("Creating Demo Admin User...");
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await prisma.user.upsert({
            where: { email: 'admin@demo.com' },
            update: {
                password: hashedPassword,
                tenantId: tenant.id,
                role: 'TENANT_ADMIN'
            },
            create: {
                email: 'admin@demo.com',
                name: 'Demo Admin',
                password: hashedPassword,
                role: 'TENANT_ADMIN',
                tenantId: tenant.id
            }
        });
        console.log(`User: ${user.email} (Tenant: ${tenant.slug})`);

        // 3. Create Categories
        console.log("Creating Categories...");
        const categoriesData = [
            { id: 'demo-cat-1', name: 'เมนูแนะนำ', order: 1 },
            { id: 'demo-cat-2', name: 'อาหารจานเดียว', order: 2 },
            { id: 'demo-cat-3', name: 'เครื่องดื่ม', order: 3 },
        ];

        for (const cat of categoriesData) {
            await prisma.category.upsert({
                where: { id: cat.id },
                update: { name: cat.name, order: cat.order },
                create: {
                    id: cat.id,
                    name: cat.name,
                    order: cat.order,
                    tenantId: tenant.id
                }
            });
        }

        // 4. Create Products
        console.log("Creating Products...");
        const productsData = [
            {
                id: 'demo-prod-1',
                name: 'ข้าวผัดกะเพราไข่ดาว',
                description: 'เมนูยอดฮิต รสชาติจัดจ้าน หอมใบกะเพราแท้ๆ',
                price: 79.0,
                imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop',
                categoryId: 'demo-cat-2',
                isRecommended: true,
                tenantId: tenant.id
            },
            {
                id: 'demo-prod-2',
                name: 'ข้าวผัดอาม่า',
                description: 'สูตรลับส่งต่อรุ่นสู่รุ่น หอมกลิ่นกระทะ',
                price: 89.0,
                imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800&auto=format&fit=crop',
                categoryId: 'demo-cat-2',
                isRecommended: true,
                tenantId: tenant.id
            },
            {
                id: 'demo-prod-3',
                name: 'ชามะนาวแท้',
                description: 'เพิ่มความสดชื่นด้วยมะนาวคั้นสดแป้นพิจิตร',
                price: 45.0,
                imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
                categoryId: 'demo-cat-3',
                tenantId: tenant.id
            }
        ];

        for (const p of productsData) {
            await prisma.product.upsert({
                where: { id: p.id },
                update: p,
                create: p
            });
        }

        console.log("Demo-shop and User seeding completed!");
    } catch (error) {
        console.error("Error during seeding:", error);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
