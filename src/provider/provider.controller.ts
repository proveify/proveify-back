import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpException,
    Param,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { ProviderService } from "@app/provider/provider.service";
import { ApiTags } from "@nestjs/swagger";
import { ProvidersParamsDto } from "./dto/params.dto";
import { GetProvidersDocumentation } from "./decorators/documentations/provider.documentation";
import { ProviderEntity } from "./entities/provider.entity";
import { ProviderUpdateDto } from "./dto/provider.dto";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { FormDataRequest } from "nestjs-form-data";

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

    @UseInterceptors(ClassSerializerInterceptor)
    @Get(":id")
    public async getProviderById(@Param() params: { id: string }): Promise<ProviderEntity> {
        const provider = await this.providerService.getProviderById(params.id);

        if (!provider) {
            throw new HttpException("Provider not found", 404);
        }

        return new ProviderEntity(provider);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard)
    @FormDataRequest()
    @Put(":id")
    public async updateProvider(
        @Param() params: { id: string },
        @Body() data: ProviderUpdateDto,
    ): Promise<ProviderEntity> {
        const providerExists = await this.providerService.providerExists(params.id);

        if (!providerExists) {
            throw new HttpException("Provider not found", 404);
        }

        const provider = await this.providerService.updateProvider(params.id, data);

        return new ProviderEntity(provider);
    }
}
