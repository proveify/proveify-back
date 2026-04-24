import { applyDecorators } from "@nestjs/common";
import {
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiBadRequestResponse,
} from "@nestjs/swagger";
import { ProviderQuoteEntity } from "../../entities/provider-quote.entity";

const PROVIDER_QUOTE_TAG = "Cotizaciones de Proveedores";

export function CreateProviderQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PROVIDER_QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Crear una cotización de proveedor para una solicitud pública",
            description:
                "Permite a un **Proveedor** enviar una propuesta económica en respuesta a una solicitud de cotización pública abierta.",
        }),
        ApiCreatedResponse({
            description: "Cotización enviada exitosamente.",
            type: ProviderQuoteEntity,
        }),
        ApiForbiddenResponse({
            description: "El usuario no tiene un perfil de proveedor activo.",
        }),
        ApiNotFoundResponse({
            description: "La solicitud pública referenciada no existe.",
        }),
        ApiConflictResponse({
            description:
                "El proveedor ya ha enviado una cotización previa para esta misma solicitud.",
        }),
    );
}

export function GetProviderQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PROVIDER_QUOTE_TAG),
        ApiOperation({
            summary: "Obtener todas las cotizaciones de proveedores",
            description:
                "Recupera una lista paginada de todas las cotizaciones enviadas por proveedores en el sistema. Soporta diversos filtros.",
        }),
        ApiQuery({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de registros (1-30).",
        }),
        ApiQuery({
            name: "offset",
            required: false,
            type: Number,
            description: "Desplazamiento para paginación.",
        }),
        ApiQuery({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Orden cronológico.",
        }),
        ApiQuery({
            name: "public_request_id",
            required: false,
            type: String,
            description: "Filtrar por ID de solicitud pública específica.",
        }),
        ApiQuery({
            name: "status",
            required: false,
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED"],
            description: "Filtrar por estado de la cotización.",
        }),
        ApiOkResponse({
            description: "Listado de cotizaciones obtenido exitosamente.",
            type: [ProviderQuoteEntity],
        }),
    );
}

export function GetProviderQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PROVIDER_QUOTE_TAG),
        ApiOperation({
            summary: "Obtener cotización por ID",
            description:
                "Recupera la información detallada de una cotización de proveedor específica.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID único de la cotización.",
        }),
        ApiOkResponse({
            description: "Cotización encontrada exitosamente.",
            type: ProviderQuoteEntity,
        }),
        ApiNotFoundResponse({
            description: "Cotización no encontrada.",
        }),
    );
}

export function GetMyProviderQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PROVIDER_QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Obtener mis cotizaciones enviadas",
            description:
                "Recupera el listado de cotizaciones que el proveedor autenticado ha enviado a diferentes solicitudes.",
        }),
        ApiQuery({
            name: "limit",
            required: false,
            type: Number,
        }),
        ApiQuery({
            name: "offset",
            required: false,
            type: Number,
        }),
        ApiQuery({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
        }),
        ApiQuery({
            name: "public_request_id",
            required: false,
            type: String,
        }),
        ApiQuery({
            name: "status",
            required: false,
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED"],
        }),
        ApiOkResponse({
            description: "Listado de cotizaciones propias obtenido exitosamente.",
            type: [ProviderQuoteEntity],
        }),
        ApiForbiddenResponse({
            description: "El usuario no cuenta con un perfil de proveedor.",
        }),
    );
}

export function UpdateProviderQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PROVIDER_QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Actualizar una cotización",
            description:
                "Permite modificar los datos de una cotización enviada. **Nota:** Solo las cotizaciones en estado 'PENDING' pueden ser editadas.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
        }),
        ApiOkResponse({
            description: "Cotización actualizada exitosamente.",
            type: ProviderQuoteEntity,
        }),
        ApiBadRequestResponse({
            description:
                "No se puede actualizar una cotización que ya ha sido aceptada o rechazada.",
        }),
        ApiForbiddenResponse({
            description: "No tienes permisos para modificar esta cotización.",
        }),
        ApiNotFoundResponse({
            description: "Cotización no encontrada.",
        }),
    );
}

export function DeleteProviderQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PROVIDER_QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Eliminar una cotización",
            description:
                "Remueve permanentemente una cotización del sistema. Solo aplicable por el autor.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
        }),
        ApiOkResponse({
            description: "Cotización eliminada exitosamente.",
            type: ProviderQuoteEntity,
        }),
        ApiForbiddenResponse({
            description: "No tienes permisos para eliminar esta cotización.",
        }),
        ApiNotFoundResponse({
            description: "Cotización no encontrada.",
        }),
    );
}
