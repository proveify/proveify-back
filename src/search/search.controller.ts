import { Controller, Get, Query } from "@nestjs/common";
import { SearchParamsDto } from "@app/search/dto/searchParamsDto";
import { Search } from "@app/search/interfaces/search.interface";
import { SearchService } from "@app/search/search.service";

@Controller("search")
export class SearchController {
    public constructor(private readonly searchService: SearchService) {}

    @Get()
    public async query(@Query() params: SearchParamsDto): Promise<Search> {
        const providers = await this.searchService.findProvider(params.query);
        const services = await this.searchService.findService(params.query);
        const products = await this.searchService.findProducts(params.query);

        return {
            providers: providers,
            services: services,
            products: products,
        };
    }
}
