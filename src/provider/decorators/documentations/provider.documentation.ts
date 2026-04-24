import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { applyDecorators } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiNotFoundResponse,
} from "@nestjs/swagger";

const PROVIDER_TAG = "Proveedores";

export function GetProvidersDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PROVIDER_TAG),
        ApiOperation({
            summary: "Obtener proveedores",
            description:
                "Recupera una lista paginada de **Proveedores** registrados en la plataforma. Permite filtrar y ordenar los resultados.",
        }),
        ApiParam({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de registros por consulta (rango: 1 a 30).",
        }),
        ApiParam({
            name: "offset",
            required: false,
            type: Number,
            description: "Número de registros a saltar para la paginación.",
        }),
        ApiParam({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Dirección del ordenamiento.",
        }),
        ApiOkResponse({
            description: "Listado de proveedores obtenido exitosamente.",
            type: [ProviderEntity],
        }),
    );
}

export function UpdateProviderDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PROVIDER_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Actualizar perfil de proveedor",
            description:
                "Permite al proveedor autenticado actualizar sus datos comerciales. Todos los campos son opcionales y soporta carga de archivos mediante `multipart/form-data`.",
        }),
        ApiConsumes("multipart/form-data"),
        ApiOkResponse({
            description: "Perfil de proveedor actualizado exitosamente.",
            type: ProviderEntity,
        }),
        ApiNotFoundResponse({ description: "No se encontró el perfil del proveedor." }),
    );
}

export function GetProviderDocumention(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PROVIDER_TAG),
        ApiOperation({
            summary: "Obtener proveedor por ID",
            description:
                "Recupera la información detallada de un **Proveedor** específico utilizando su identificador único.",
        }),
        ApiOkResponse({
            description: "Información del proveedor obtenida exitosamente.",
            type: ProviderEntity,
        }),
        ApiNotFoundResponse({ description: "Proveedor no encontrado." }),
    );
}
