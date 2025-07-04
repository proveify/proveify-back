import { Module } from "@nestjs/common";
import { ItemController } from "./item.controller";
import { ItemService } from "./item.service";
import { ItemPrismaRepository } from "./repositories/item-prisma.repository";
import { FavoritePrismaRepository } from "./repositories/favorite-prisma.repository";

@Module({
    controllers: [ItemController],
    providers: [ItemService, ItemPrismaRepository, FavoritePrismaRepository],
})
export class ItemModule {}
