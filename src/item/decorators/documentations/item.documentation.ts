import { ItemEntity } from "@app/item/entities/item.entity";
import { applyDecorators } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from "@nestjs/swagger";
import { FavoriteEntity } from "@app/item/entities/favorite.entity";

const ITEM_TAG = "Artículos";

export function PostCreateItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(ITEM_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Crear artículo",
            description:
                "Registra un nuevo **Artículo** o producto en el catálogo. Permite la carga de archivos multimedia mediante `multipart/form-data`.",
        }),
        ApiConsumes("multipart/form-data"),
        ApiCreatedResponse({
            description: "Artículo creado exitosamente.",
            type: ItemEntity,
        }),
    );
}

export function GetItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(ITEM_TAG),
        ApiOperation({
            summary: "Obtener artículo por ID",
            description:
                "Recupera los detalles detallados de un **Artículo** específico. Si el usuario está autenticado, se incluye el estado de 'favorito' del artículo para ese usuario.",
        }),
        ApiOkResponse({
            description: "Artículo encontrado exitosamente.",
            type: ItemEntity,
        }),
        ApiNotFoundResponse({
            description: "El artículo solicitado no existe.",
        }),
    );
}

export function GetItemsDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(ITEM_TAG),
        ApiOperation({
            summary: "Obtener todos los artículos",
            description:
                "Recupera una lista paginada y filtrable de **Artículos**. Incluye metadatos sobre favoritos si se proporciona un token de sesión válido.",
        }),
        ApiParam({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de registros por consulta (rango sugerido: 1-30).",
        }),
        ApiParam({
            name: "offset",
            required: false,
            type: Number,
            description: "Número de registros a saltar para paginación.",
        }),
        ApiParam({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Dirección del ordenamiento cronológico.",
        }),
        ApiOkResponse({
            description: "Listado de artículos recuperado exitosamente.",
            type: [ItemEntity],
        }),
    );
}

export function PutSelfItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(ITEM_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Actualizar artículo propio",
            description:
                "Permite modificar los datos de un **Artículo** perteneciente al usuario autenticado. Soporta la actualización de imágenes asociadas.",
        }),
        ApiConsumes("multipart/form-data"),
        ApiOkResponse({
            description: "Artículo actualizado exitosamente.",
            type: ItemEntity,
        }),
        ApiNotFoundResponse({
            description:
                "No se encontró el artículo para actualizar o el usuario no tiene permisos.",
        }),
    );
}

export function DeleteSelfItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(ITEM_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Eliminar artículo propio",
            description:
                "Elimina permanentemente un **Artículo** del catálogo. Solo el propietario puede realizar esta acción.",
        }),
        ApiOkResponse({
            description: "Artículo eliminado exitosamente.",
            type: ItemEntity,
        }),
        ApiNotFoundResponse({
            description: "No se encontró el artículo para eliminar.",
        }),
    );
}

export function AddFavoriteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(ITEM_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Agregar artículo a favoritos",
            description:
                "Añade un **Artículo** específico a la lista de favoritos del usuario autenticado.",
        }),
        ApiOkResponse({
            type: FavoriteEntity,
            description: "Artículo agregado a favoritos exitosamente.",
        }),
    );
}

export function RemoveFavoriteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(ITEM_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Eliminar artículo de favoritos",
            description:
                "Remueve un **Artículo** de la lista de favoritos del usuario autenticado.",
        }),
        ApiOkResponse({
            type: FavoriteEntity,
            description: "Artículo removido de favoritos exitosamente.",
        }),
    );
}

export function GetFavoritesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(ITEM_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Obtener artículos favoritos",
            description:
                "Recupera el listado de todos los **Artículos** que el usuario ha marcado como preferidos.",
        }),
        ApiParam({
            name: "limit",
            required: false,
            type: Number,
            description: "Máximo número de elementos a retornar.",
        }),
        ApiParam({
            name: "offset",
            required: false,
            type: Number,
            description: "Punto de inicio para la paginación.",
        }),
        ApiParam({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Orden cronológico de los resultados.",
        }),
        ApiOkResponse({
            type: [FavoriteEntity],
            description: "Lista de favoritos recuperada exitosamente.",
        }),
    );
}

export function GetProviderItemsDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(ITEM_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Obtener artículos de un proveedor",
            description:
                "Consulta el catálogo de **Artículos** disponibles ofrecidos por un proveedor específico.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "Identificador único del proveedor.",
        }),
        ApiParam({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de registros.",
        }),
        ApiParam({
            name: "offset",
            required: false,
            type: Number,
            description: "Desplazamiento para paginación.",
        }),
        ApiParam({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Orden de los resultados.",
        }),
        ApiOkResponse({
            description: "Catálogo del proveedor obtenido exitosamente.",
            type: [ItemEntity],
        }),
    );
}
