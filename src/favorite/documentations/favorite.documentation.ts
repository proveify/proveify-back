import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam } from "@nestjs/swagger";
import { FavoriteEntity } from "../../entities/favorite.entity";

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
