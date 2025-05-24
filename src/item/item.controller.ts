import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    Req,
    ClassSerializerInterceptor,
    UseInterceptors,
} from "@nestjs/common";
import { ItemService } from "./item.service";
import { FormDataRequest } from "nestjs-form-data";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { FavoriteParamsDto, ItemCreateDto, ItemParamDto, ItemUpdateDto } from "./dto/item.dto";
import { ItemEntity } from "./entities/item.entity";
import { FavoriteEntity } from "./entities/favorite.entity";
import { Request } from "express";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import {
    AddFavoriteDocumentation,
    DeleteSelfItemDocumentation,
    GetFavoritesDocumentation,
    GetItemDocumentation,
    GetItemsDocumentation,
    PostCreateItemDocumentation,
    PutSelfItemDocumentation,
    RemoveFavoriteDocumentation,
} from "./decorators/documentations/item.documentation";

@Controller("items")
export class ItemController {
    public constructor(private itemService: ItemService) {}

    @FormDataRequest()
    @UseGuards(JwtAuthGuard)
    @PostCreateItemDocumentation()
    @Post("self")
    public async createItem(@Body() data: ItemCreateDto): Promise<ItemEntity> {
        const itemDataInput = await this.itemService.prepareCreate(data);
        const itemModel = await this.itemService.createItem(itemDataInput);
        const item = new ItemEntity(itemModel);

        return item;
    }

    @FormDataRequest()
    @UseGuards(JwtAuthGuard)
    @PutSelfItemDocumentation()
    @Put("self/:id")
    public async updateItem(
        @Body() data: ItemUpdateDto,
        @Param() params: { id: string },
    ): Promise<ItemEntity> {
        const itemDataInput = await this.itemService.prepareUpdate(data, params.id);
        const item = await this.itemService.updateItem(itemDataInput, params.id);
        return new ItemEntity(item);
    }

    @UseGuards(JwtAuthGuard)
    @DeleteSelfItemDocumentation()
    @Delete("self/:id")
    public async deleteItem(@Param() params: { id: string }): Promise<ItemEntity> {
        const item = await this.itemService.deleteItem(params.id);
        return new ItemEntity(item);
    }

    @UseGuards(JwtAuthGuard)
    @GetItemsDocumentation()
    @Get()
    public async getItems(
        @Query() params: ItemParamDto,
        @Req() req: Request & { user: TokenPayload },
    ): Promise<ItemEntity[]> {
        const userId = req.user.id;
        const items = await this.itemService.getItemsWithFavoriteInfo(params, userId);
        return items.map((item) => new ItemEntity(item));
    }

    @UseGuards(JwtAuthGuard)
    @GetItemDocumentation()
    @Get(":id")
    public async getItemById(
        @Param() params: { id: string },
        @Req() req: Request & { user: TokenPayload },
    ): Promise<ItemEntity> {
        const userId = req.user.id;
        const item = await this.itemService.findItemByIdWithFavoriteInfo(params.id, userId);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        return new ItemEntity(item);
    }

    @Post("favorite/:itemId")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @AddFavoriteDocumentation()
    public async addFavorite(
        @Req() req: Request & { user: TokenPayload },
        @Param("itemId") itemId: string,
    ): Promise<FavoriteEntity> {
        try {
            const favorite = await this.itemService.addFavorite(req.user.id, itemId);
            return new FavoriteEntity(favorite);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException("Failed to add item to favorites", 400);
        }
    }

    @Delete("favorite/:itemId")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @RemoveFavoriteDocumentation()
    public async removeFavorite(
        @Req() req: Request & { user: TokenPayload },
        @Param("itemId") itemId: string,
    ): Promise<FavoriteEntity> {
        try {
            const favorite = await this.itemService.removeFavorite(req.user.id, itemId);
            return new FavoriteEntity(favorite);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException("Failed to remove item from favorites", 400);
        }
    }

    @Get("favorites")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @GetFavoritesDocumentation()
    public async getFavorites(
        @Req() req: Request & { user: TokenPayload },
        @Query() params: FavoriteParamsDto,
    ): Promise<FavoriteEntity[]> {
        const favorites = await this.itemService.getFavorites(req.user.id, params);
        return favorites.map((favorite) => new FavoriteEntity(favorite));
    }
}
