import { applyDecorators } from "@nestjs/common";
import {
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiProduces,
    ApiConsumes,
    ApiOkResponse,
    ApiTags,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiForbiddenResponse,
} from "@nestjs/swagger";
import { QuoteEntity } from "../../entities/quote.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";

const QUOTE_TAG = "Cotizaciones";

export function CreateQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Solicitar una nueva cotización",
            description:
                "Permite a un usuario (autenticado o anónimo) enviar una solicitud de cotización a un proveedor específico. Se crea un registro inicial en estado 'PENDIENTE'.",
        }),
        ApiCreatedResponse({
            description: "Solicitud de cotización enviada exitosamente.",
            type: QuoteEntity,
        }),
        ApiBadRequestResponse({
            description: "Datos de entrada inválidos o errores de validación.",
        }),
        ApiNotFoundResponse({
            description: "El proveedor especificado no existe.",
        }),
    );
}

export function GetQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(QUOTE_TAG),
        ApiOperation({
            summary: "Listar todas las cotizaciones",
            description:
                "Recupera un listado paginado de cotizaciones con capacidades de filtrado por proveedor, estado, usuario y búsqueda general.",
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
            description: "Paginación: registros a saltar.",
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
        ApiQuery({
            name: "provider_id",
            required: false,
            type: String,
            description: "Filtrar por proveedor específico.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiQuery({
            name: "status",
            required: false,
            type: String,
            enum: ["PENDING", "QUOTED", "REJECTED"],
            description: "Filtrar por estado actual.",
            example: "PENDING",
        }),
        ApiQuery({
            name: "user_id",
            required: false,
            type: String,
            description: "Filtrar por el usuario solicitante.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiQuery({
            name: "search",
            required: false,
            type: String,
            description: "Buscar por nombre, email o descripción.",
            example: "desarrollo",
        }),
        ApiOkResponse({
            description: "Listado de cotizaciones obtenido exitosamente.",
            type: [QuoteEntity],
        }),
    );
}

export function GetQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(QUOTE_TAG),
        ApiOperation({
            summary: "Obtener detalle de cotización",
            description:
                "Recupera la información completa de una cotización específica, incluyendo los artículos solicitados y datos del proveedor.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID único de la cotización.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiOkResponse({
            description: "Información de la cotización obtenida exitosamente.",
            type: QuoteEntity,
        }),
        ApiNotFoundResponse({
            description: "No se encontró la cotización solicitada.",
        }),
    );
}

export function GetMyQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Obtener mis cotizaciones recibidas (como proveedor)",
            description:
                "Recupera las solicitudes de cotización que han sido enviadas al perfil de proveedor del usuario autenticado.",
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
            description: "Desplazamiento.",
            example: 0,
        }),
        ApiQuery({
            name: "order_by_date",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Orden cronológico.",
            example: "desc",
        }),
        ApiOkResponse({
            description: "Listado de cotizaciones recibidas obtenido exitosamente.",
            type: [QuoteEntity],
        }),
        ApiForbiddenResponse({
            description: "El usuario no tiene un perfil de proveedor asociado.",
        }),
    );
}

export function UpdateQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Actualizar una cotización",
            description:
                "Permite al proveedor modificar el estado o detalles de una cotización recibida.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID de la cotización a actualizar.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiOkResponse({
            description: "Cotización actualizada exitosamente.",
            type: QuoteEntity,
        }),
        ApiNotFoundResponse({
            description: "La cotización no existe.",
        }),
        ApiForbiddenResponse({
            description: "No tienes permisos para actualizar esta cotización.",
        }),
    );
}

export function DeleteQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Eliminar una cotización",
            description: "Remueve permanentemente una cotización del sistema.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID de la cotización a eliminar.",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiOkResponse({
            description: "Cotización eliminada exitosamente.",
            type: BasicResponseEntity,
        }),
        ApiNotFoundResponse({
            description: "La cotización no existe.",
        }),
        ApiForbiddenResponse({
            description: "No tienes permisos para realizar esta acción.",
        }),
    );
}

export function PrintQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Generar PDF de la cotización",
            description:
                "Genera dinámicamente un documento PDF con los detalles de la cotización para su descarga o visualización.",
        }),
        ApiProduces("application/pdf"),
        ApiOkResponse({
            description: "Archivo PDF generado exitosamente.",
            schema: {
                type: "string",
                format: "binary",
            },
        }),
        ApiNotFoundResponse({
            description: "Cotización no encontrada para generar el documento.",
        }),
    );
}

export function SentQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Enviar/Actualizar propuesta de cotización",
            description:
                "Permite al proveedor subir documentos adjuntos o actualizar el estado de una cotización para marcarla como 'enviada'.",
        }),
        ApiOkResponse({
            description: "Propuesta enviada o actualizada exitosamente.",
        }),
        ApiNotFoundResponse({
            description: "La cotización no existe.",
        }),
        ApiConsumes("multipart/form-data"),
    );
}

export function GetQuoteMessageDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(QUOTE_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Obtener mensajes de la cotización",
            description:
                "Recupera el historial de comunicación asociado a una cotización específica.",
        }),
    );
}
