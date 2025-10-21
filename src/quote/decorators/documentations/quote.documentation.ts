import { applyDecorators } from "@nestjs/common";
import {
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiProduces,
} from "@nestjs/swagger";
import { QuoteEntity } from "../../entities/quote.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";

export function CreateQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Create a new quote request",
            description:
                "Creates a new quote request. Can be used by anonymous users or authenticated users.",
        }),
        ApiResponse({
            status: 201,
            description: "Quote request created successfully",
            type: QuoteEntity,
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - validation errors",
        }),
        ApiResponse({
            status: 404,
            description: "Provider not found",
        }),
        ApiBearerAuth(),
    );
}

export function GetQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get all quotes with filters",
            description: "Retrieves paginated list of quotes with optional filtering and search",
        }),
        ApiQuery({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de 1 a 30 registros por consulta",
            example: 10,
        }),
        ApiQuery({
            name: "offset",
            required: false,
            type: Number,
            description: "Número de registros a saltar para paginación",
            example: 0,
        }),
        ApiQuery({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Orden de los resultados por fecha de creación",
            example: "desc",
        }),
        ApiQuery({
            name: "provider_id",
            required: false,
            type: String,
            description: "Filtrar por ID de proveedor específico",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiQuery({
            name: "status",
            required: false,
            type: String,
            enum: ["PENDING", "QUOTED", "REJECTED"],
            description: "Filtrar por estado de cotización",
            example: "PENDING",
        }),
        ApiQuery({
            name: "user_id",
            required: false,
            type: String,
            description: "Filtrar por ID de usuario específico",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiQuery({
            name: "search",
            required: false,
            type: String,
            description: "Buscar en nombre, email y descripción",
            example: "desarrollo",
        }),
        ApiResponse({
            status: 200,
            description: "List of quotes",
            type: [QuoteEntity],
        }),
    );
}

export function GetQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get a quote by ID",
            description: "Retrieves a specific quote with provider and items information",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID of the quote",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiResponse({
            status: 200,
            description: "Quote found",
            type: QuoteEntity,
        }),
        ApiResponse({
            status: 404,
            description: "Quote not found",
        }),
    );
}

export function GetMyQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get provider's received quotes",
            description: "Retrieves all quotes received by the authenticated provider",
        }),
        ApiQuery({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de 1 a 30 registros por consulta",
            example: 10,
        }),
        ApiQuery({
            name: "offset",
            required: false,
            type: Number,
            description: "Número de registros a saltar para paginación",
            example: 0,
        }),
        ApiQuery({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Orden de los resultados por fecha de creación",
            example: "desc",
        }),
        ApiResponse({
            status: 200,
            description: "List of provider's quotes",
            type: [QuoteEntity],
        }),
        ApiResponse({
            status: 403,
            description: "User does not have a provider profile",
        }),
        ApiBearerAuth(),
    );
}

export function UpdateQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Update a quote",
            description:
                "Update a quote received by the provider. Only the quote owner can update it.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID of the quote to update",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiResponse({
            status: 200,
            description: "Quote updated successfully",
            type: QuoteEntity,
        }),
        ApiResponse({
            status: 404,
            description: "Quote not found",
        }),
        ApiResponse({
            status: 403,
            description: "Forbidden - not the quote owner",
        }),
        ApiBearerAuth(),
    );
}

export function DeleteQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Delete a quote",
            description:
                "Delete a quote received by the provider. Only the quote owner can delete it.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID of the quote to delete",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiResponse({
            status: 200,
            description: "Quote deleted successfully",
            type: BasicResponseEntity,
        }),
        ApiResponse({
            status: 404,
            description: "Quote not found",
        }),
        ApiResponse({
            status: 403,
            description: "Forbidden - not the quote owner",
        }),
        ApiBearerAuth(),
    );
}

export function PrintQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Descargar/visualizar PDF de la cotización",
            description: "Genera y devuelve un archivo PDF con el detalle de la cotización.",
        }),
        ApiProduces("application/pdf"),
        ApiResponse({
            status: 200,
            description: "PDF generado correctamente",
            schema: {
                type: "string",
                format: "binary",
            },
        }),
        ApiResponse({
            status: 404,
            description: "Quote not found",
        }),
        ApiBearerAuth(),
    );
}
