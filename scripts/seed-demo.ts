import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding demo data...");

    // 1. Create Demo Shop Tenant
    const demoShop = await prisma.tenant.upsert({
        where: { slug: "demo-shop" },
        update: {},
        create: {
            name: "Tamjai Demo Store",
            slug: "demo-shop",
            phone: "02-123-4567",
            address: "123 Demo Street, Bangkok",
            bankName: "K-Bank",
            bankAccount: "1234567890",
            isActive: true,
        }
    });

    console.log("Demo Shop created:", demoShop.name);

    // 2. Create Categories
    const categories = [
        { name: "🔥 Popular", slug: "popular" },
        { name: "🍜 Main Course", slug: "main" },
        { name: "🥤 Beverages", slug: "drinks" },
    ];

    const createdCategories = [];
    for (const cat of categories) {
        const c = await prisma.category.upsert({
            where: {
                tenantId_name: {
                    name: cat.name,
                    tenantId: demoShop.id
                }
            },
            update: {},
            create: {
                name: cat.name,
                slug: cat.slug,
                tenantId: demoShop.id,
            }
        });
        createdCategories.push(c);
    }

    // 3. Create Products
    const products = [
        { name: "Signature Ramen", price: 189, catIdx: 1, img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400" },
        { name: "Spicy Miso Ramen", price: 199, catIdx: 1, img: "https://images.unsplash.com/photo-1591814441473-7df892042f21?auto=format&fit=crop&q=80&w=400" },
        { name: "Thai Milk Tea", price: 65, catIdx: 2, img: "https://images.unsplash.com/photo-1558857563-b371f768bcc6?auto=format&fit=crop&q=80&w=400" },
        { name: "Green Tea Latte", price: 75, catIdx: 2, img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=400" },
    ];

    for (const prod of products) {
        // @ts-ignore
        await prisma.product.upsert({
            where: {
                tenantId_name: {
                    name: prod.name,
                    tenantId: demoShop.id
                }
            },
            update: {
                price: prod.price,
                imageUrl: prod.img,
            },
            create: {
                name: prod.name,
                price: prod.price,
                imageUrl: prod.img,
                tenantId: demoShop.id,
                categoryId: createdCategories[prod.catIdx].id,
            }
        });
    }

    // 4. Create Tables
    for (let i = 1; i <= 15; i++) {
        // @ts-ignore
        await prisma.table.upsert({
            where: {
                tenantId_number: {
                    tenantId: demoShop.id,
                    number: i.toString()
                }
            },
            update: {},
            create: {
                number: i.toString(),
                capacity: 4,
                status: i % 5 === 0 ? "occupied" : "vacant",
                tenantId: demoShop.id,
            }
        });
    }

    console.log("Seeding complete! Demo shop is ready.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
