import { PrismaClient } from "@prisma/client";

export async function seedSubcategories(prisma: PrismaClient): Promise<void> {
    console.log("Iniciando seed de subcategorías...");
    
    // Obtener todas las categorías
    const categories = await prisma.categories.findMany();
    
    // Mapeo de subcategorías por categoría (nombre de categoría => subcategorías)
    const subcategoriesByCategory: Record<string, { name: string; description: string }[]> = {
        "Electrónica": [
            { name: "Smartphones", description: "Teléfonos inteligentes y accesorios" },
            { name: "Laptops y computadoras", description: "Equipos informáticos y accesorios" },
            { name: "Accesorios electrónicos", description: "Complementos para dispositivos electrónicos" },
            { name: "Audio y video", description: "Equipos de sonido y visualización" },
            { name: "Cámaras y fotografía", description: "Equipos fotográficos y accesorios" }
        ],
        "Ropa y moda": [
            { name: "Ropa de hombre", description: "Prendas y conjuntos para hombres" },
            { name: "Ropa de mujer", description: "Prendas y conjuntos para mujeres" },
            { name: "Ropa de mujer Calzado", description: "Zapatos, tenis y todo tipo de calzado" },
            { name: "Bolsos y mochilas", description: "Bolsas, mochilas y equipaje de mano" },
            { name: "Joyería y relojes", description: "Accesorios decorativos personales" }
        ],
        "Hogar y muebles": [
            { name: "Muebles", description: "Mobiliario para el hogar" },
            { name: "Decoración", description: "Artículos decorativos y ornamentales" },
            { name: "Electrodomésticos", description: "Aparatos eléctricos para el hogar" },
            { name: "Iluminación", description: "Lámparas y sistemas de iluminación" },
            { name: "Herramientas y bricolaje", description: "Equipos para reparaciones y proyectos DIY" }
        ],
        "Deportes y fitness": [
            { name: "Equipos deportivos", description: "Material para diferentes disciplinas deportivas" },
            { name: "Ropa deportiva", description: "Indumentaria especializada para actividades físicas" },
            { name: "Accesorios de fitness", description: "Complementos para entrenamiento y ejercicio" },
            { name: "Bicicletas y accesorios", description: "Equipos de ciclismo y complementos" },
            { name: "Camping y outdoor", description: "Artículos para actividades al aire libre" }
        ],
        "Juguetes y juegos": [
            { name: "Juguetes educativos", description: "Juguetes para el aprendizaje y desarrollo" },
            { name: "Juguetes de acción y figuras", description: "Muñecos y figuras coleccionables" },
            { name: "Juegos de mesa", description: "Juegos de tablero y cartas" },
            { name: "Videojuegos", description: "Juegos digitales y consolas" },
            { name: "Puzzles y rompecabezas", description: "Juegos de lógica e ingenio" }
        ],
        "Salud y belleza": [
            { name: "Cuidado de la piel", description: "Productos para el cuidado dermatológico" },
            { name: "Maquillaje", description: "Cosméticos y productos de belleza" },
            { name: "Perfumes", description: "Fragancias y aromas personales" },
            { name: "Suplementos y vitaminas", description: "Complementos para la salud y bienestar" },
            { name: "Productos para el cabello", description: "Artículos para el cuidado capilar" }
        ],
        "Alimentos y bebidas": [
            { name: "Comida orgánica", description: "Alimentos de producción ecológica" },
            { name: "Bebidas alcohólicas", description: "Vinos, cervezas y licores" },
            { name: "Snacks y golosinas", description: "Aperitivos y dulces" },
            { name: "Productos gourmet", description: "Alimentos de alta calidad y especialidades" },
            { name: "Suplementos dietéticos", description: "Complementos alimenticios especializados" }
        ],
        "Libros, música y películas": [
            { name: "Libros", description: "Obras literarias de todos los géneros" },
            { name: "Películas", description: "Largometrajes y cortometrajes" },
            { name: "Música", description: "Álbumes y composiciones musicales" },
            { name: "Instrumentos musicales", description: "Herramientas para la creación musical" },
            { name: "Revistas y cómics", description: "Publicaciones periódicas e historietas" }
        ],
        "Tecnología para el hogar inteligente": [
            { name: "Dispositivos inteligentes", description: "Gadgets conectados para el hogar" },
            { name: "Seguridad y cámaras", description: "Sistemas de vigilancia y protección" },
            { name: "Automación del hogar", description: "Sistemas para automatizar procesos domésticos" },
            { name: "Gadgets tecnológicos", description: "Dispositivos innovadores y accesorios tech" }
        ],
        "Servicios": [
            { name: "Servicios de envío", description: "Transporte y entrega de mercancías" },
            { name: "Reparaciones y mantenimiento", description: "Servicios de arreglo y conservación" },
            { name: "Cursos y clases", description: "Formación y enseñanza" },
            { name: "Diseño y desarrollo", description: "Servicios creativos y de programación" },
            { name: "Servicios de belleza y salud", description: "Tratamientos de bienestar y estética" }
        ],
        "Automóviles y vehículos": [
            { name: "Autos", description: "Vehículos de cuatro ruedas" },
            { name: "Motocicletas", description: "Vehículos de dos ruedas" },
            { name: "Accesorios para autos", description: "Complementos para vehículos" },
            { name: "Repuestos automotrices", description: "Piezas de recambio para vehículos" },
            { name: "Herramientas y equipos para vehículos", description: "Instrumentos para mantenimiento vehicular" }
        ],
        "Arte y coleccionables": [
            { name: "Arte y pinturas", description: "Obras artísticas visuales" },
            { name: "Antigüedades", description: "Objetos de épocas pasadas con valor" },
            { name: "Coleccionables y ediciones limitadas", description: "Artículos de valor para coleccionistas" },
            { name: "Materiales para artistas", description: "Suministros para creación artística" }
        ],
        "Viajes y turismo": [
            { name: "Boletos de avión", description: "Pasajes para transporte aéreo" },
            { name: "Paquetes turísticos", description: "Conjuntos de servicios para viajeros" },
            { name: "Alojamientos y hospedaje", description: "Estancias y hospedajes temporales" },
            { name: "Accesorios de viaje", description: "Artículos para facilitar los desplazamientos" }
        ],
        "Tecnología y software": [
            { name: "Programas y aplicaciones", description: "Software para diversos usos" },
            { name: "Licencias de software", description: "Permisos de uso para programas" },
            { name: "Herramientas de productividad", description: "Aplicaciones para mejorar eficiencia" },
            { name: "Juegos y entretenimiento digital", description: "Software para ocio digital" }
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