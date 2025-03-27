import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Query,
    UseInterceptors,
} from "@nestjs/common";
import { ProviderService } from "@app/provider/provider.service";
import { ApiTags } from "@nestjs/swagger";
import { ProvidersParamsDto } from "./dto/params.dto";
import { GetProvidersDocumentation } from "./decorators/documentations/provider.documentation";
import { ProviderEntity } from "./entities/provider.entity";

@ApiTags("Provider")
@Controller("providers")
export class ProviderController {
    public constructor(private providerService: ProviderService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @GetProvidersDocumentation()
    @Get()
    public async getProviders(@Query() params: ProvidersParamsDto): Promise<ProviderEntity[]> {
        const providers = await this.providerService.getProviders(params);
        return providers.map((provider) => new ProviderEntity(provider));
    }
}
