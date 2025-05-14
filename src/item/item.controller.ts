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
} from "@nestjs/common";
import { ItemService } from "./item.service";
import { FormDataRequest } from "nestjs-form-data";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { ItemCreateDto, ItemParamDto, ItemUpdateDto } from "./dto/item.dto";
import { ItemEntity } from "./entities/item.entity";
import {
    DeleteSelfItemDocumentation,
    GetItemDocumentation,
    GetItemsDocumentation,
    PostCreateItemDocumentation,
    PutSelfItemDocumentation,
} from "./decorators/documentations/item.documentation";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import { Request } from "express";

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
}
