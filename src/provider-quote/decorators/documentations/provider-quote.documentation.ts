import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ProviderQuoteEntity } from "../../entities/provider-quote.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";

export function CreateProviderQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Create a provider quote for a public request",
            description: "Allows a provider to submit a quote for a public request",
        }),
        ApiResponse({
            status: 201,
            description: "Provider quote created successfully",
            type: ProviderQuoteEntity,
        }),
        ApiResponse({
            status: 403,
            description: "User does not have a provider profile",
        }),
        ApiResponse({
            status: 404,
            description: "Public request not found",
        }),
        ApiResponse({
            status: 409,
            description: "Provider has already submitted a quote for this request",
        }),
        ApiBearerAuth(),
    );
}

export function GetProviderQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get all provider quotes",
            description: "Retrieves paginated list of provider quotes with optional filtering",
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
        ApiQuery({
            name: "public_request_id",
            required: false,
            type: String,
            description: "Filter by public request ID",
        }),
        ApiQuery({
            name: "status",
            required: false,
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED"],
        }),
        ApiResponse({
            status: 200,
            description: "List of provider quotes",
            type: [ProviderQuoteEntity],
        }),
    );
}

export function GetProviderQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get a provider quote by ID",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
        }),
        ApiResponse({
            status: 200,
            description: "Provider quote found",
            type: ProviderQuoteEntity,
        }),
        ApiResponse({
            status: 404,
            description: "Provider quote not found",
        }),
    );
}

export function GetMyProviderQuotesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get authenticated provider's quotes",
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
        ApiResponse({
            status: 200,
            description: "List of provider's quotes",
            type: [ProviderQuoteEntity],
        }),
        ApiResponse({
            status: 403,
            description: "User does not have a provider profile",
        }),
        ApiBearerAuth(),
    );
}

export function UpdateProviderQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Update a provider quote",
            description: "Only pending quotes can be updated",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
        }),
        ApiResponse({
            status: 200,
            description: "Provider quote updated successfully",
            type: ProviderQuoteEntity,
        }),
        ApiResponse({
            status: 400,
            description: "Cannot update accepted/rejected quotes",
        }),
        ApiResponse({
            status: 403,
            description: "Can only update own quotes",
        }),
        ApiResponse({
            status: 404,
            description: "Provider quote not found",
        }),
        ApiBearerAuth(),
    );
}

export function DeleteProviderQuoteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Delete a provider quote",
        }),
        ApiParam({
            name: "id",
            required: true,
            type: String,
        }),
        ApiResponse({
            status: 200,
            description: "Provider quote deleted successfully",
            type: BasicResponseEntity,
        }),
        ApiResponse({
            status: 403,
            description: "Can only delete own quotes",
        }),
        ApiResponse({
            status: 404,
            description: "Provider quote not found",
        }),
        ApiBearerAuth(),
    );
}
