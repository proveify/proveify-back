import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam } from "@nestjs/swagger";

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
    );
}
