import { PrismaClient } from "@prisma/client";
import { seedCategories } from "./categories-seed";
import { seedSubcategories } from "./subcategories-seed";

const prisma = new PrismaClient();

async function main() {
    // Seed del plan por defecto
    const planNone = await prisma.plans.upsert({
        where: { plan_key: "PLAN_NONE" },
        update: {},
        create: {
            plan_key: "PLAN_NONE",
            name: "Sin plan",
            description: "Plan por defecto para la creación de proveedores",
            price: 0.0,
        },
    });

    console.log(planNone);

    // Seed de categorías
    await seedCategories(prisma);

    // Seed de subcategorías
    await seedSubcategories(prisma);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
