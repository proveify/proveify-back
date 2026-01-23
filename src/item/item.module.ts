import { Module } from "@nestjs/common";
import { ItemController } from "./item.controller";
import { ItemService } from "./item.service";
import { ItemPrismaRepository } from "./repositories/item-prisma.repository";
import { FavoritePrismaRepository } from "./repositories/favorite-prisma.repository";
import { ItemFactory } from "@app/item/factories/item.factory";
import { ProviderModule } from "@app/provider/provider.module";

@Module({
    controllers: [ItemController],
    providers: [ItemService, ItemPrismaRepository, FavoritePrismaRepository, ItemFactory],
    imports: [ProviderModule],
    exports: [ItemFactory, ItemService],
})
export class ItemModule {}
