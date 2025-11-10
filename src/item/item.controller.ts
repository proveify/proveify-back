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
    UseInterceptors,
} from "@nestjs/common";
import { ItemService } from "./item.service";
import { FormDataRequest } from "nestjs-form-data";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { OptionalJwtAuthGuard } from "@app/auth/guards/optional-jwt.guard";
import { FavoriteParamsDto, ItemCreateDto, ItemParamDto, ItemUpdateDto } from "./dto/item.dto";
import { ItemEntity } from "./entities/item.entity";
import { FavoriteEntity } from "./entities/favorite.entity";
import {
    AddFavoriteDocumentation,
    DeleteSelfItemDocumentation,
    GetFavoritesDocumentation,
    GetItemDocumentation,
    GetItemsDocumentation,
    GetProviderItemsDocumentation,
    PostCreateItemDocumentation,
    PutSelfItemDocumentation,
    RemoveFavoriteDocumentation,
} from "./decorators/documentations/item.documentation";
import { ApiTags } from "@nestjs/swagger";
import { LoadUser } from "@app/common/decorators/load-user.decorator";
import { OwnerSerializerInterceptor } from "@app/common/interceptors/owner-serializer.interceptor";

@ApiTags("Items")
@Controller("items")
@UseInterceptors(OwnerSerializerInterceptor)
export class ItemController {
    public constructor(private itemService: ItemService) {}

    @FormDataRequest()
    @UseGuards(JwtAuthGuard)
    @PostCreateItemDocumentation()
    @Post()
    @LoadUser()
    public async createItem(@Body() data: ItemCreateDto): Promise<ItemEntity> {
        const itemDataInput = await this.itemService.prepareCreate(data);
        return await this.itemService.createItem(itemDataInput);
    }

    @FormDataRequest()
    @UseGuards(JwtAuthGuard)
    @PutSelfItemDocumentation()
    @Put(":id")
    @LoadUser()
    public async updateItem(
        @Body() data: ItemUpdateDto,
        @Param("id") id: string,
    ): Promise<ItemEntity> {
        const itemDataInput = await this.itemService.prepareUpdate(data, id);
        return await this.itemService.updateItem(itemDataInput, id);
    }

    @UseGuards(JwtAuthGuard)
    @DeleteSelfItemDocumentation()
    @Delete(":id")
    @LoadUser()
    public async deleteItem(@Param("id") id: string): Promise<ItemEntity> {
        return await this.itemService.deleteItem(id);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get("provider/:id")
    @GetProviderItemsDocumentation()
    @LoadUser()
    public async getProviderItems(
        @Query() params: ItemParamDto,
        @Param("id") id: string,
    ): Promise<ItemEntity[]> {
        return await this.itemService.getProviderItems(id, params);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @GetItemsDocumentation()
    @Get()
    @LoadUser()
    public async getItems(@Query() params: ItemParamDto): Promise<ItemEntity[]> {
        return this.itemService.getItems(params);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @GetItemDocumentation()
    @Get(":id")
    @LoadUser()
    public async getItemById(@Param("id") id: string): Promise<ItemEntity> {
        const item = await this.itemService.getItemById(id);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        return item;
    }

    @Post(":id/favorite")
    @UseGuards(JwtAuthGuard)
    @AddFavoriteDocumentation()
    @LoadUser()
    public async addFavorite(@Param("id") id: string): Promise<FavoriteEntity> {
        return await this.itemService.addFavorite(id);
    }

    @Delete(":id/favorite")
    @UseGuards(JwtAuthGuard)
    @RemoveFavoriteDocumentation()
    @LoadUser()
    public async removeFavorite(@Param("id") id: string): Promise<FavoriteEntity> {
        return await this.itemService.removeFavorite(id);
    }

    @Get("favorites")
    @UseGuards(JwtAuthGuard)
    @GetFavoritesDocumentation()
    @LoadUser()
    public async getFavorites(@Query() params: FavoriteParamsDto): Promise<FavoriteEntity[]> {
        return await this.itemService.getFavorites(params);
    }
}
