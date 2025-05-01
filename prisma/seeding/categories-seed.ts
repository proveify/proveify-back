import { PrismaClient } from "@prisma/client";

export async function seedCategories(prisma: PrismaClient): Promise<void> {
    const categories = [
        {
            name: "Electrónica",
            description: "Productos electrónicos, gadgets y accesorios",
        },
        {
            name: "Ropa y moda",
            description: "Prendas de vestir, calzado y accesorios de moda",
        },
        {
            name: "Hogar y muebles",
            description: "Muebles, decoración y artículos para el hogar",
        },
        {
            name: "Deportes y fitness",
            description: "Equipamiento deportivo y accesorios para fitness",
        },
        {
            name: "Juguetes y juegos",
            description: "Juguetes, juegos de mesa y entretenimiento",
        },
        {
            name: "Salud y belleza",
            description: "Productos de cuidado personal, salud y belleza",
        },
        {
            name: "Alimentos y bebidas",
            description: "Productos alimenticios, bebidas y gastronomía",
        },
        {
            name: "Libros, música y películas",
            description: "Entretenimiento multimedia y literatura",
        },
        {
            name: "Tecnología para el hogar inteligente",
            description: "Dispositivos y sistemas para hogares inteligentes",
        },
        {
            name: "Servicios",
            description: "Servicios profesionales y personales",
        },
        {
            name: "Automóviles y vehículos",
            description: "Vehículos, accesorios y repuestos",
        },
        {
            name: "Arte y coleccionables",
            description: "Obras de arte, antigüedades y artículos de colección",
        },
        {
            name: "Viajes y turismo",
            description: "Servicios y productos relacionados con viajes y turismo",
        },
        {
            name: "Tecnología y software",
            description: "Software, aplicaciones y servicios tecnológicos",
        },
    ];

    console.log("Iniciando seed de categorías...");

    // Obtener categorías existentes
    const existingCategories = await prisma.categories.findMany({
        select: { name: true },
    });

    const existingCategoryNames = existingCategories.map((cat) => cat.name);

    // Filtrar categorías que ya existen
    const categoriesToCreate = categories.filter(
        (category) => !existingCategoryNames.includes(category.name),
    );

    if (categoriesToCreate.length > 0) {
        // Crear todas las nuevas categorías en un lote
        await prisma.categories.createMany({
            data: categoriesToCreate,
            skipDuplicates: true,
        });

        console.log(`Se crearon ${categoriesToCreate.length} nuevas categorías`);
    } else {
        console.log("No hay nuevas categorías para crear");
    }

    console.log("Seed de categorías completado!");
}
