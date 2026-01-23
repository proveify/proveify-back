import { Module } from "@nestjs/common";
import { SearchController } from "@app/search/search.controller";
import { SearchService } from "./search.service";
import { ItemModule } from "@app/item/item.module";

@Module({
    controllers: [SearchController],
    providers: [SearchService],
    imports: [ItemModule],
})
export class SearchModule {}
