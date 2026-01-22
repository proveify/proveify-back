import { Module } from "@nestjs/common";
import { SearchController } from "@app/search/search.controller";
import { SearchService } from "./search.service";

@Module({
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule {}
