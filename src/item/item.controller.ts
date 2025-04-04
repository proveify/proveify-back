import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ItemService } from "./item.service";
import { FormDataRequest } from "nestjs-form-data";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { ItemCreateDto } from "./dto/item.dto";
import { ItemEntity } from "./entities/item.entity";

@Controller("items")
export class ItemController {
    public constructor(private itemService: ItemService) {}

    @FormDataRequest()
    @UseGuards(JwtAuthGuard)
    @Post("self")
    public async createItem(@Body() data: ItemCreateDto): Promise<ItemEntity> {
        const itemDataInput = await this.itemService.prepareCreate(data);
        const item = await this.itemService.createItem(itemDataInput);
        return new ItemEntity(item);
    }
}
