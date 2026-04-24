import { applyDecorators } from "@nestjs/common";
import {
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
    ApiForbiddenResponse,
} from "@nestjs/swagger";
import { PublicRequestEntity } from "../../entities/public-request.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";
import { ProviderQuoteEntity } from "@app/provider-quote/entities/provider-quote.entity";

const PUBLIC_REQUEST_TAG = "Solicitudes Públicas";

export function CreatePublicRequestDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PUBLIC_REQUEST_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Crear una nueva solicitud pública",
            description:
                "Registra una solicitud de cotización abierta en el sistema. Otros proveedores podrán verla y enviar sus propuestas económicas.",
        }),
        ApiCreatedResponse({
            description: "Solicitud pública creada exitosamente.",
            type: PublicRequestEntity,
        }),
        ApiBadRequestResponse({
            description: "Datos de entrada inválidos o errores de validación.",
        }),
        ApiUnauthorizedResponse({
            description: "No se proporcionó un token de acceso válido.",
        }),
    );
}

export function GetPublicRequestsDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PUBLIC_REQUEST_TAG),
        ApiOperation({
            summary: "Obtener todas las solicitudes públicas",
            description:
                "Recupera una lista paginada de todas las solicitudes de cotización disponibles. Incluye capacidades de búsqueda y filtrado.",
        }),
        ApiQuery({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de registros (1-30).",
            example: 10,
        }),
        ApiQuery({
            name: "offset",
            required: false,
            type: Number,
            description: "Número de registros a omitir.",
            example: 0,
        }),
        ApiQuery({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Orden cronológico por fecha de creación.",
            example: "desc",
        }),
        ApiQuery({
            name: "user_id",
            required: false,
            type: String,
            description: "Filtrar solicitudes por un autor específico.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiQuery({
            name: "search",
            required: false,
            type: String,
            description: "Palabra clave para buscar en título o descripción.",
            example: "diseño",
        }),
        ApiOkResponse({
            description: "Listado de solicitudes obtenido exitosamente.",
            type: [PublicRequestEntity],
        }),
        ApiBadRequestResponse({
            description: "Parámetros de consulta inválidos.",
        }),
    );
}

export function GetPublicRequestDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PUBLIC_REQUEST_TAG),
        ApiOperation({
            summary: "Obtener solicitud por ID",
            description:
                "Recupera la información detallada de una solicitud pública específica, incluyendo datos del solicitante.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID único de la solicitud.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiOkResponse({
            description: "Solicitud encontrada exitosamente.",
            type: PublicRequestEntity,
        }),
        ApiNotFoundResponse({
            description: "La solicitud solicitada no existe.",
        }),
        ApiBadRequestResponse({
            description: "Formato de ID inválido.",
        }),
    );
}

export function UpdatePublicRequestDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PUBLIC_REQUEST_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Actualizar solicitud propia",
            description:
                "Permite al autor de una solicitud modificar sus detalles. Solo el creador tiene permisos para realizar esta acción.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID de la solicitud a actualizar.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiOkResponse({
            description: "Solicitud actualizada exitosamente.",
            type: PublicRequestEntity,
        }),
        ApiNotFoundResponse({
            description: "No se encontró la solicitud para actualizar.",
        }),
        ApiForbiddenResponse({
            description: "No tienes permisos para editar esta solicitud (no eres el propietario).",
        }),
        ApiUnauthorizedResponse({
            description: "Se requiere autenticación para esta acción.",
        }),
    );
}

export function DeletePublicRequestDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PUBLIC_REQUEST_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Eliminar solicitud propia",
            description:
                "Remueve permanentemente una solicitud pública creada por el usuario autenticado.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID de la solicitud a eliminar.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiOkResponse({
            description: "Solicitud eliminada exitosamente.",
            type: BasicResponseEntity,
        }),
        ApiNotFoundResponse({
            description: "No se encontró la solicitud.",
        }),
        ApiForbiddenResponse({
            description: "No tienes permisos para eliminar esta solicitud.",
        }),
        ApiUnauthorizedResponse({
            description: "Autenticación requerida.",
        }),
    );
}

export function GetMyPublicRequestsDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PUBLIC_REQUEST_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Obtener mis solicitudes públicas",
            description:
                "Recupera todas las solicitudes que el usuario autenticado ha publicado en la plataforma.",
        }),
        ApiQuery({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de registros.",
            example: 10,
        }),
        ApiQuery({
            name: "offset",
            required: false,
            type: Number,
            description: "Desplazamiento para paginación.",
            example: 0,
        }),
        ApiQuery({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Orden cronológico.",
            example: "desc",
        }),
        ApiOkResponse({
            description: "Listado de solicitudes propias recuperado exitosamente.",
            type: [PublicRequestEntity],
        }),
        ApiUnauthorizedResponse({
            description: "Token no válido o no proporcionado.",
        }),
    );
}

export function GetPublicRequestProviderQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PUBLIC_REQUEST_TAG),
        ApiOperation({
            summary: "Obtener cotizaciones de proveedores para una solicitud",
            description:
                "Recupera todas las propuestas económicas que diversos proveedores han enviado en respuesta a esta solicitud pública.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID de la solicitud pública.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiQuery({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de registros.",
        }),
        ApiQuery({
            name: "offset",
            required: false,
            type: Number,
            description: "Desplazamiento.",
        }),
        ApiQuery({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Orden.",
        }),
        ApiOkResponse({
            description: "Listado de propuestas de proveedores obtenido exitosamente.",
            type: [ProviderQuoteEntity],
        }),
        ApiNotFoundResponse({
            description: "La solicitud pública especificada no existe.",
        }),
    );
}
