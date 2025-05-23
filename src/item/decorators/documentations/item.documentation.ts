import { ItemEntity } from "@app/item/entities/item.entity";
import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam } from "@nestjs/swagger";
import { FavoriteEntity } from "@app/item/entities/favorite.entity";

export function PostCreateItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Create item" }),
        ApiConsumes("multipart/form-data"),
        ApiBearerAuth(),
    );
}

export function GetItemDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get item by ID",
            description:
                "Retrieves item details. If user is authenticated, includes favorite status.",
        }),
        ApiOkResponse({ type: ItemEntity }),
    );
}

export function GetItemsDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get all items",
            description:
                "Retrieves paginated list of items. If user is authenticated, includes favorite status for each item.",
        }),
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

// Funciones movidas desde favorite.documentation.ts
export function AddFavoriteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Add item to favorites" }),
        ApiParam({
            name: "itemId",
            required: true,
            type: String,
            description: "ID of the item to add to favorites",
        }),
        ApiOkResponse({
            type: FavoriteEntity,
            description: "Item successfully added to favorites",
        }),
        ApiBearerAuth(),
    );
}

export function RemoveFavoriteDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Remove item from favorites" }),
        ApiParam({
            name: "itemId",
            required: true,
            type: String,
            description: "ID of the item to remove from favorites",
        }),
        ApiOkResponse({
            type: FavoriteEntity,
            description: "Item successfully removed from favorites",
        }),
        ApiBearerAuth(),
    );
}

export function GetFavoritesDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get user's favorite items" }),
        ApiParam({
            name: "limit",
            required: false,
            type: Number,
            description: "Maximum number of items to return (1-30)",
        }),
        ApiParam({
            name: "offset",
            required: false,
            type: Number,
            description: "Number of items to skip for pagination",
        }),
        ApiParam({
            name: "order_by",
            required: false,
            type: String,
            enum: ["asc", "desc"],
            description: "Order of results by creation date",
        }),
        ApiOkResponse({
            type: [FavoriteEntity],
            description: "List of favorite items",
        }),
        ApiBearerAuth(),
    );
}
