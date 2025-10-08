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
import { OptionalJwtAuthGuard } from "@app/auth/guards/optional-jwt.guard";
import {
    GetProviderDocumention,
    GetProvidersDocumentation,
    UpdateProviderDocumentation,
} from "./decorators/documentations/provider.documentation";
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
    @UseGuards(OptionalJwtAuthGuard)
    @GetProviderDocumention()
    @Get(":id")
    public async getProviderById(@Param() params: { id: string }): Promise<ProviderEntity> {
        const provider = await this.providerService.getProviderById(params.id);

        if (!provider) {
            throw new HttpException("Provider not found", 404);
        }

        return provider;
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard)
    @FormDataRequest()
    @UpdateProviderDocumentation()
    @Put()
    public async updateProvider(@Body() data: ProviderUpdateDto): Promise<ProviderEntity> {
        return this.providerService.updateProvider(data);
    }
}
