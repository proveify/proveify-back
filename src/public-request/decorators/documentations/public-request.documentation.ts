import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import { PublicRequestEntity } from "../../entities/public-request.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";
import { QuoteEntity } from "@app/quote/entities/quote.entity";
import { ProviderQuoteEntity } from "@app/provider-quote/entities/provider-quote.entity";

export function CreatePublicRequestDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Create a new public request",
            description: "Creates a new public request for the authenticated user",
        }),
        ApiResponse({
            status: 201,
            description: "Public request created successfully",
            type: PublicRequestEntity,
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - validation errors",
        }),
        ApiResponse({
            status: 401,
            description: "Unauthorized - authentication required",
        }),
        ApiBearerAuth(),
    );
}

export function GetPublicRequestsDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get all public requests",
            description:
                "Retrieves paginated list of public requests with optional filtering and search",
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
            description: "Buscar en título y descripción",
            example: "diseño",
        }),
        ApiResponse({
            status: 200,
            description: "List of public requests",
            type: [PublicRequestEntity],
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - invalid query parameters",
        }),
    );
}

export function GetPublicRequestDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get a public request by ID",
            description: "Retrieves a specific public request with user information",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID of the public request",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiResponse({
            status: 200,
            description: "Public request found",
            type: PublicRequestEntity,
        }),
        ApiResponse({
            status: 404,
            description: "Public request not found",
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - invalid ID format",
        }),
    );
}

export function UpdatePublicRequestDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Update user's own public request",
            description:
                "Update a public request created by the authenticated user. Only the owner can update their requests.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID of the public request to update",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiResponse({
            status: 200,
            description: "Public request updated successfully",
            type: PublicRequestEntity,
        }),
        ApiResponse({
            status: 404,
            description: "Public request not found",
        }),
        ApiResponse({
            status: 403,
            description: "Forbidden - not the owner of this request",
        }),
        ApiResponse({
            status: 401,
            description: "Unauthorized - authentication required",
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - validation errors",
        }),
        ApiBearerAuth(),
    );
}

export function DeletePublicRequestDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Delete user's own public request",
            description:
                "Delete a public request created by the authenticated user. Only the owner can delete their requests.",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID of the public request to delete",
            example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        ApiResponse({
            status: 200,
            description: "Public request deleted successfully",
            type: BasicResponseEntity,
        }),
        ApiResponse({
            status: 404,
            description: "Public request not found",
        }),
        ApiResponse({
            status: 403,
            description: "Forbidden - not the owner of this request",
        }),
        ApiResponse({
            status: 401,
            description: "Unauthorized - authentication required",
        }),
        ApiBearerAuth(),
    );
}

export function GetMyPublicRequestsDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get authenticated user's public requests",
            description:
                "Retrieves all public requests created by the authenticated user with pagination",
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
            description: "List of user's public requests",
            type: [PublicRequestEntity],
        }),
        ApiResponse({
            status: 401,
            description: "Unauthorized - authentication required",
        }),
        ApiResponse({
            status: 400,
            description: "Bad request - invalid query parameters",
        }),
        ApiBearerAuth(),
    );
}

export function GetPublicRequestQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get quotes for a public request",
            description: "Retrieves all quotes submitted by providers for this public request",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
            description: "ID of the public request",
        }),
        ApiQuery({
            name: "limit",
            required: false,
            type: Number,
            description: "Límite de 1 a 30 registros por consulta",
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
        ApiResponse({
            status: 200,
            description: "List of quotes for the public request",
            type: [QuoteEntity],
        }),
        ApiResponse({
            status: 404,
            description: "Public request not found",
        }),
    );
}

export function GetPublicRequestProviderQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get provider quotes for a public request",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
        }),
        ApiResponse({
            status: 200,
            description: "List of provider quotes",
            type: [ProviderQuoteEntity],
        }),
        ApiResponse({
            status: 404,
            description: "Public request not found",
        }),
    );
}
