import { PrismaClient } from "@prisma/client";

export async function seedSubcategories(prisma: PrismaClient): Promise<void> {
    console.log("Iniciando seed de subcategorías...");
    
    // Obtener todas las categorías
    const categories = await prisma.categories.findMany();
    
    // Mapeo de subcategorías por categoría (nombre de categoría => subcategorías)
    const subcategoriesByCategory: Record<string, { name: string; description: string }[]> = {
        "Electrónica": [
            { name: "Smartphones", description: "Teléfonos inteligentes y accesorios" },
            { name: "Computadoras", description: "Laptops, PCs de escritorio y componentes" },
            { name: "Audio", description: "Audífonos, altavoces y equipos de sonido" },
            { name: "Videojuegos", description: "Consolas, juegos y accesorios para gaming" }
        ],
        "Ropa y moda": [
            { name: "Ropa para hombre", description: "Camisas, pantalones y otros para hombres" },
            { name: "Ropa para mujer", description: "Blusas, faldas y otros para mujeres" },
            { name: "Calzado", description: "Zapatos, tenis y botas" },
            { name: "Accesorios", description: "Bolsos, billeteras, cinturones y joyería" }
        ],
        "Hogar y muebles": [
            { name: "Muebles", description: "Sofás, mesas, sillas y camas" },
            { name: "Decoración", description: "Artículos decorativos para el hogar" },
            { name: "Electrodomésticos", description: "Aparatos y utensilios para el hogar" },
            { name: "Cocina", description: "Utensilios, vajillas y accesorios de cocina" }
        ],
        "Deportes y fitness": [
            { name: "Equipo deportivo", description: "Artículos para diferentes deportes" },
            { name: "Ropa deportiva", description: "Prendas especializadas para actividades físicas" },
            { name: "Suplementos", description: "Productos para nutrición deportiva" },
            { name: "Accesorios fitness", description: "Artículos para entrenamiento y ejercicio" }
        ],
        "Juguetes y juegos": [
            { name: "Juguetes para niños", description: "Artículos recreativos para niños" },
            { name: "Juegos de mesa", description: "Juegos de tablero y cartas" },
            { name: "Rompecabezas", description: "Puzzles y juegos de ingenio" },
            { name: "Juguetes educativos", description: "Artículos para aprendizaje y desarrollo" }
        ],
        "Salud y belleza": [
            { name: "Cuidado personal", description: "Productos para higiene y cuidado diario" },
            { name: "Maquillaje", description: "Cosméticos y productos de belleza" },
            { name: "Cuidado del cabello", description: "Productos para el cuidado capilar" },
            { name: "Suplementos y vitaminas", description: "Productos para la salud y bienestar" }
        ],
        "Alimentos y bebidas": [
            { name: "Alimentos no perecederos", description: "Alimentos con larga vida útil" },
            { name: "Bebidas", description: "Refrescos, jugos, café y otras bebidas" },
            { name: "Snacks", description: "Aperitivos y alimentos para picar" },
            { name: "Productos gourmet", description: "Especialidades culinarias y delicatessen" }
        ],
        "Libros, música y películas": [
            { name: "Libros", description: "Literatura, ficción y no ficción" },
            { name: "Música", description: "CDs, vinilos y accesorios musicales" },
            { name: "Películas y series", description: "DVDs, Blu-rays y contenido digital" },
            { name: "Instrumentos musicales", description: "Equipos para creación musical" }
        ],
        "Tecnología para el hogar inteligente": [
            { name: "Asistentes virtuales", description: "Dispositivos con asistentes de voz" },
            { name: "Iluminación inteligente", description: "Sistemas de iluminación automatizados" },
            { name: "Seguridad", description: "Cámaras, sensores y sistemas de seguridad" },
            { name: "Electrodomésticos inteligentes", description: "Aparatos conectados para el hogar" }
        ],
        "Servicios": [
            { name: "Servicios profesionales", description: "Consultoría, asesoramiento y otros" },
            { name: "Servicios domésticos", description: "Limpieza, mantenimiento y reparaciones" },
            { name: "Servicios digitales", description: "Diseño web, marketing digital y más" },
            { name: "Servicios educativos", description: "Cursos, tutorías y formación" }
        ],
        "Automóviles y vehículos": [
            { name: "Repuestos", description: "Piezas y componentes para vehículos" },
            { name: "Accesorios", description: "Artículos para personalizar vehículos" },
            { name: "Herramientas", description: "Equipos para mantenimiento y reparación" },
            { name: "Productos de limpieza", description: "Artículos para el cuidado de vehículos" }
        ],
        "Arte y coleccionables": [
            { name: "Pintura y dibujo", description: "Obras y materiales artísticos" },
            { name: "Escultura", description: "Piezas tridimensionales artísticas" },
            { name: "Artesanías", description: "Productos hechos a mano" },
            { name: "Coleccionables", description: "Artículos de colección y antigüedades" }
        ],
        "Viajes y turismo": [
            { name: "Equipaje", description: "Maletas, mochilas y accesorios de viaje" },
            { name: "Accesorios de viaje", description: "Artículos para comodidad al viajar" },
            { name: "Guías y mapas", description: "Materiales informativos para viajeros" },
            { name: "Souvenirs", description: "Recuerdos y artículos representativos" }
        ],
        "Tecnología y software": [
            { name: "Aplicaciones", description: "Software y apps para diversos usos" },
            { name: "Servicios cloud", description: "Almacenamiento y servicios en la nube" },
            { name: "Seguridad informática", description: "Protección digital y ciberseguridad" },
            { name: "Desarrollo", description: "Herramientas para desarrollo de software" }
        ]
    };
    
    // Contador de subcategorías creadas
    let createdCount = 0;
    
    // Para cada categoría, crear sus subcategorías
    for (const category of categories) {
        const subcategories = subcategoriesByCategory[category.name] || [];
        
        if (subcategories) {
            // Verificar subcategorías existentes para esta categoría
            const existingSubcategories = await prisma.subcategories.findMany({
                where: { id_category: category.id },
                select: { name: true }
            });
            
            const existingSubcategoryNames = existingSubcategories.map(sub => sub.name);
            
            // Filtrar subcategorías que ya existen
            const subcategoriesToCreate = subcategories.filter(
                subcategory => !existingSubcategoryNames.includes(subcategory.name)
            );
            
            if (subcategoriesToCreate.length > 0) {
                // Preparar los datos con el id_category correspondiente
                const subcategoriesData = subcategoriesToCreate.map(sub => ({
                    ...sub,
                    id_category: category.id
                }));
                
                // Crear las subcategorías
                await prisma.subcategories.createMany({
                    data: subcategoriesData,
                    skipDuplicates: true
                });
                
                createdCount += subcategoriesToCreate.length;
                console.log(`Se crearon ${subcategoriesToCreate.length} subcategorías para ${category.name}`);
            }
        }
    }
    
    console.log(`Total: Se crearon ${createdCount} subcategorías`);
    console.log("Seed de subcategorías completado!");
}