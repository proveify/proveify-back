import { ProviderEntityDocumentation } from "@app/provider/entities/provider.entity";
import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam } from "@nestjs/swagger";

export function GetProvidersDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get providers" }),
        ApiParam({
            name: "limit",
            required: false,
            type: Number,
            description: "limite de 1 a 30 registros por consulta",
        }),
        ApiParam({
            name: "offset",
            required: false,
            type: Number,
        }),
        ApiParam({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
        }),
        ApiOkResponse({
            type: [ProviderEntityDocumentation],
        }),
    );
}

export function UpadteProviderDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Update provider logued",
            description:
                "actualiza los datos del proveedor logueado (todos los campos son opcionales)",
        }),
        ApiConsumes("multipart/form-data"),
        ApiOkResponse({
            type: ProviderEntityDocumentation,
        }),
        ApiBearerAuth(),
    );
}

export function GetProviderDocumention(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get provider by id" }),
        ApiOkResponse({
            type: ProviderEntityDocumentation,
        }),
    );
}
