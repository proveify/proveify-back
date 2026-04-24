import { applyDecorators } from "@nestjs/common";
import {
    ApiOperation,
    ApiTags,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
} from "@nestjs/swagger";
import { CategoryEntity } from "../../entities/category.entity";

const CATEGORY_TAG = "Categorías";

export function CreateCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(CATEGORY_TAG),
        ApiOperation({
            summary: "Crear una nueva categoría",
            description:
                "Registra una nueva **Categoría** principal en el sistema. Útil para organizar el catálogo general de productos y servicios.",
        }),
        ApiCreatedResponse({
            description: "Categoría creada exitosamente.",
            type: CategoryEntity,
        }),
    );
}

export function GetCategoriesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(CATEGORY_TAG),
        ApiOperation({
            summary: "Obtener todas las categorías",
            description:
                "Recupera un listado completo de todas las **Categorías** registradas, incluyendo sus subcategorías asociadas.",
        }),
        ApiOkResponse({
            description: "Listado de categorías obtenido exitosamente.",
            type: [CategoryEntity],
        }),
    );
}

export function GetCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(CATEGORY_TAG),
        ApiOperation({
            summary: "Obtener una categoría por ID",
            description:
                "Busca y devuelve la información detallada de una **Categoría** específica mediante su identificador único.",
        }),
        ApiOkResponse({
            description: "Categoría encontrada exitosamente.",
            type: CategoryEntity,
        }),
        ApiNotFoundResponse({ description: "Categoría no encontrada." }),
    );
}

export function UpdateCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(CATEGORY_TAG),
        ApiOperation({
            summary: "Actualizar una categoría",
            description:
                "Modifica los datos de una **Categoría** existente identificada por su ID.",
        }),
        ApiOkResponse({
            description: "Categoría actualizada exitosamente.",
            type: CategoryEntity,
        }),
        ApiNotFoundResponse({ description: "Categoría no encontrada." }),
    );
}

export function DeleteCategoryDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(CATEGORY_TAG),
        ApiOperation({
            summary: "Eliminar una categoría",
            description: "Elimina permanentemente una **Categoría** del sistema.",
        }),
        ApiOkResponse({
            description: "Categoría eliminada exitosamente.",
            type: CategoryEntity,
        }),
        ApiNotFoundResponse({ description: "Categoría no encontrada." }),
    );
}
