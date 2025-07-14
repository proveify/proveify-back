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
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Items")
@Controller("items")
export class ItemController {
    public constructor(private itemService: ItemService) {}

    @FormDataRequest()
    @UseGuards(JwtAuthGuard)
    @PostCreateItemDocumentation()
    @Post("self")
    public async createItem(@Body() data: ItemCreateDto): Promise<ItemEntity> {
        const itemDataInput = await this.itemService.prepareCreate(data);
        return await this.itemService.createItem(itemDataInput);
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
        return await this.itemService.updateItem(itemDataInput, params.id);
    }

    @UseGuards(JwtAuthGuard)
    @DeleteSelfItemDocumentation()
    @Delete("self/:id")
    public async deleteItem(@Param() params: { id: string }): Promise<ItemEntity> {
        return await this.itemService.deleteItem(params.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get("provider/self")
    public async getProviderItems(@Query() params: ItemParamDto): Promise<ItemEntity[]> {
        return await this.itemService.getProviderItems(params);
    }

    @GetItemsDocumentation()
    @Get()
    public async getItems(@Query() params: ItemParamDto): Promise<ItemEntity[]> {
        return await this.itemService.getItemsPublic(params);
    }

    @UseGuards(JwtAuthGuard)
    @Get("authenticated")
    public async getItemsAuthenticated(
        @Query() params: ItemParamDto,
        @Req() req: Request & { user: TokenPayload },
    ): Promise<ItemEntity[]> {
        return await this.itemService.getItemsWithFavoriteInfo(params, req.user.id);
    }

    @GetItemDocumentation()
    @Get(":id")
    public async getItemById(@Param() params: { id: string }): Promise<ItemEntity> {
        const item = await this.itemService.findItemByIdPublic(params.id);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        return item;
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/authenticated")
    public async getItemByIdAuthenticated(
        @Param() params: { id: string },
        @Req() req: Request & { user: TokenPayload },
    ): Promise<ItemEntity> {
        const item = await this.itemService.findItemByIdWithFavoriteInfo(params.id, req.user.id);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        return item;
    }

    @Post("favorite/:itemId")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @AddFavoriteDocumentation()
    public async addFavorite(
        @Req() req: Request & { user: TokenPayload },
        @Param("itemId") itemId: string,
    ): Promise<FavoriteEntity> {
        return await this.itemService.addFavorite(req.user.id, itemId);
    }

    @Delete("favorite/:itemId")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @RemoveFavoriteDocumentation()
    public async removeFavorite(
        @Req() req: Request & { user: TokenPayload },
        @Param("itemId") itemId: string,
    ): Promise<FavoriteEntity> {
        return await this.itemService.removeFavorite(req.user.id, itemId);
    }

    @Get("favorites")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @GetFavoritesDocumentation()
    public async getFavorites(
        @Req() req: Request & { user: TokenPayload },
        @Query() params: FavoriteParamsDto,
    ): Promise<FavoriteEntity[]> {
        return await this.itemService.getFavorites(req.user.id, params);
    }
}
