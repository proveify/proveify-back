import { ItemEntity } from "@app/item/entities/item.entity";
import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam } from "@nestjs/swagger";

export function PostCreateItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Create item" }),
        ApiConsumes("multipart/form-data"),
        ApiBearerAuth(),
    );
}

export function GetItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get item for user loged" }),
        ApiOkResponse({ type: ItemEntity }),
    );
}

export function GetItemsDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get items for user loged" }),
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
        ApiOkResponse({ type: [ItemEntity] }),
    );
}

export function PutSelfItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Update item for user loged" }),
        ApiConsumes("multipart/form-data"),
        ApiBearerAuth(),
    );
}

export function DeleteSelfItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Delete item for user loged" }),
        ApiOkResponse({ type: ItemEntity }),
        ApiBearerAuth(),
    );
}
