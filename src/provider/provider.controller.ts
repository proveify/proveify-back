import { Controller, Get, Query } from "@nestjs/common";
import { ProviderService } from "@app/provider/provider.service";
import { ApiTags } from "@nestjs/swagger";
import { ProvidersParamsDto } from "./dto/params.dto";
import { Providers as ProviderModel } from "@prisma/client";
import { GetProvidersDocumentation } from "./decorators/documentations/provider.documentation";

@ApiTags("Provider")
@Controller("providers")
export class ProviderController {
    public constructor(private providerService: ProviderService) {}

    @GetProvidersDocumentation()
    @Get()
    public async getProviders(@Query() params: ProvidersParamsDto): Promise<ProviderModel[]> {
        return this.providerService.getProviders(params);
    }
}
