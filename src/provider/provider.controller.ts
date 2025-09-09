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
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import { Request } from "express";
import { AuthContextService } from "@app/auth/auth-context.service";

@ApiTags("Provider")
@Controller("providers")
export class ProviderController {
    public constructor(
        private providerService: ProviderService,
        private authContextService: AuthContextService,
    ) {}

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
    public async getProviderById(
        @Param() params: { id: string },
        @Req() req: Request & { user?: TokenPayload },
    ): Promise<ProviderEntity> {
        const provider = await this.providerService.getProviderById(params.id);

        if (!provider) {
            throw new HttpException("Provider not found", 404);
        }

        if (req.user) {
            try {
                const userProvider = this.authContextService.getProvider();
                if (userProvider && userProvider.id === params.id) {
                    return new ProviderEntity({
                        ...provider,
                        rut: provider.rut,
                        chamber_commerce: provider.chamber_commerce,
                        plan_id: provider.plan_id,
                        user_id: provider.user_id,
                        created_at: provider.created_at,
                        updated_at: provider.updated_at,
                    });
                }
            } catch {
                // Si falla el contexto, continuar con versión pública
            }
        }
        return new ProviderEntity(provider);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard)
    @FormDataRequest()
    @UpdateProviderDocumentation()
    @Put("self")
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
