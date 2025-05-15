import { Module } from "@nestjs/common";
import { ItemController } from "./item.controller";
import { ItemService } from "./item.service";
import { FavoriteModule } from "@app/favorite/favorite.module";

@Module({
    controllers: [ItemController],
    providers: [ItemService],
    imports: [FavoriteModule],
})
export class ItemModule {}
