import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpException,
    Param,
    Put,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { ProviderService } from "@app/provider/provider.service";
import { ApiTags } from "@nestjs/swagger";
import { ProvidersParamsDto } from "./dto/params.dto";
import {
    GetProviderDocumention,
    GetProvidersDocumentation,
    UpadteProviderDocumentation,
} from "./decorators/documentations/provider.documentation";
import { ProviderEntity } from "./entities/provider.entity";
import { ProviderUpdateDto } from "./dto/provider.dto";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { FormDataRequest } from "nestjs-form-data";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import { Request } from "express";

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
    @GetProviderDocumention()
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
    @UpadteProviderDocumentation()
    @Put()
    public async updateProvider(
        @Req() request: Request & { user: TokenPayload },
        @Body() data: ProviderUpdateDto,
    ): Promise<ProviderEntity> {
        const providers = await this.providerService.getProvidersByUserId(request.user.id);

        if (providers.length === 0) {
            throw new HttpException("Provider not found", 404);
        }

        /**
         * se tomará siempre el primer provedor del arreglo
         * las cuentas solamente tendrán un proveedor asignado
         */
        const provider = providers[0];
        const providerUpdated = await this.providerService.updateProvider(provider, data);

        return new ProviderEntity(providerUpdated);
    }
}
