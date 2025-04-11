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

    @Get()
    @GetItemsDocumentation()
    public async getItems(@Query() params: ItemParamDto): Promise<ItemEntity[]> {
        const items = await this.itemService.getItems(params);
        return items.map((item) => new ItemEntity(item));
    }

    @Get(":id")
    @GetItemDocumentation()
    public async getItemById(@Param() params: { id: string }): Promise<ItemEntity> {
        const item = await this.itemService.findItemById(params.id);

        if (!item) {
            throw new HttpException("Item not found", 404);
        }

        return new ItemEntity(item);
    }
}
