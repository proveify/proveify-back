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

    const planBasic = await prisma.plans.upsert({
        where: { plan_key: "PLAN_BASIC" },
        update: {},
        create: {
            plan_key: "PLAN_BASIC",
            name: "Plan Básico",
            description: "Subir cotizaciones manuales, aparecer en los primeros 10 artículos, recordatorio de bandeja de notificaciones, registro de catálogo en la página y reportes periódicos",
            price: 50000.0,
        },
    });

    const planAdvanced = await prisma.plans.upsert({
        where: { plan_key: "PLAN_ADVANCED" },
        update: {},
        create: {
            plan_key: "PLAN_ADVANCED",
            name: "Plan Avanzado",
            description: "Catálogo con inventario real, autocotización, subir cualquier tipo de archivo, hasta 15 cotizaciones públicas diarias, prioridad en búsqueda y solución de problemas, reportes desde la página",
            price: 150000.0,
        },
    });

    console.log(planNone);
    console.log(planBasic);
    console.log(planAdvanced);
    
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
