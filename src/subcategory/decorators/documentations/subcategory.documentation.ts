import { applyDecorators } from "@nestjs/common";
import {
    ApiOperation,
    ApiTags,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
} from "@nestjs/swagger";
import { SubcategoryEntity } from "../../entities/subcategory.entity";

const SUBCATEGORY_TAG = "Subcategorías";

export function CreateSubcategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(SUBCATEGORY_TAG),
        ApiOperation({
            summary: "Crear una nueva subcategoría",
            description:
                "Registra una nueva **Subcategoría** asociada a una categoría existente. Permite un mayor nivel de detalle en la clasificación.",
        }),
        ApiCreatedResponse({
            description: "Subcategoría creada exitosamente.",
            type: SubcategoryEntity,
        }),
    );
}

export function GetSubcategoriesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(SUBCATEGORY_TAG),
        ApiOperation({
            summary: "Obtener todas las subcategorías",
            description:
                "Recupera un listado completo de todas las **Subcategorías** registradas en el sistema.",
        }),
        ApiOkResponse({
            description: "Listado de subcategorías obtenido exitosamente.",
            type: [SubcategoryEntity],
        }),
    );
}

export function GetSubcategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(SUBCATEGORY_TAG),
        ApiOperation({
            summary: "Obtener una subcategoría por ID",
            description:
                "Busca y devuelve la información de una **Subcategoría** específica mediante su ID.",
        }),
        ApiOkResponse({
            description: "Subcategoría encontrada exitosamente.",
            type: SubcategoryEntity,
        }),
        ApiNotFoundResponse({ description: "Subcategoría no encontrada." }),
    );
}

export function GetSubcategoriesByCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(SUBCATEGORY_TAG),
        ApiOperation({
            summary: "Obtener subcategorías por categoría ID",
            description:
                "Filtra y devuelve todas las **Subcategorías** que pertenecen a una categoría específica.",
        }),
        ApiOkResponse({
            description: "Listado de subcategorías filtrado por categoría obtenido exitosamente.",
            type: [SubcategoryEntity],
        }),
    );
}

export function UpdateSubcategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(SUBCATEGORY_TAG),
        ApiOperation({
            summary: "Actualizar una subcategoría",
            description:
                "Modifica los datos de una **Subcategoría** existente identificada por su ID.",
        }),
        ApiOkResponse({
            description: "Subcategoría actualizada exitosamente.",
            type: SubcategoryEntity,
        }),
        ApiNotFoundResponse({ description: "Subcategoría no encontrada." }),
    );
}

export function DeleteSubcategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(SUBCATEGORY_TAG),
        ApiOperation({
            summary: "Eliminar una subcategoría",
            description: "Elimina permanentemente una **Subcategoría** del sistema.",
        }),
        ApiOkResponse({
            description: "Subcategoría eliminada exitosamente.",
            type: SubcategoryEntity,
        }),
        ApiNotFoundResponse({ description: "Subcategoría no encontrada." }),
    );
}
