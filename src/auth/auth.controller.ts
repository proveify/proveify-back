import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RequestAuthenticated, UserAuthenticate } from "./interfaces/auth.interface";
import { LocalAuthGuard } from "./guards/local.guard";
import { RefreshJwtAuthGuard } from "./guards/refresh-jwt.guard";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { FormDataRequest } from "nestjs-form-data";
import { UserCreateDto as UserCreateDto } from "@app/user/dto/user.dto";
import { ProviderCreateDto } from "@app/provider/dto/provider.dto";
import { ApiTags } from "@nestjs/swagger";
import {
    LoginDocumentation,
    LogOutDocumentation,
    RefreshTokenDocumentation,
    RegisterDocumentation,
    RegisterProviderDocumentation,
} from "@app/auth/decorators/documentations/auth.documentation";
import { BasicResponseEntity } from "@app/common/entities/response.entity";
import { TransactionInterceptor } from "@app/prisma/interceptors/transaction.interceptor";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    public constructor(private authService: AuthService) {}

    @RegisterDocumentation()
    @Post("register")
    @UseInterceptors(TransactionInterceptor)
    @FormDataRequest()
    public async register(@Body() data: UserCreateDto): Promise<BasicResponseEntity> {
        await this.authService.createClient(data);

        return {
            code: HttpStatus.CREATED,
            message: "Register successfully",
        };
    }

    @RegisterProviderDocumentation()
    @UseInterceptors(TransactionInterceptor)
    @Post("register/provider")
    @FormDataRequest()
    public async registerProvider(@Body() data: ProviderCreateDto): Promise<BasicResponseEntity> {
        await this.authService.createProvider(data);

        return {
            code: HttpStatus.CREATED,
            message: "Register successfully",
        };
    }

    @LoginDocumentation()
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post("login")
    public async login(@Req() req: RequestAuthenticated): Promise<UserAuthenticate> {
        return this.authService.singIn(req.user.id);
    }

    @RefreshTokenDocumentation()
    @UseGuards(RefreshJwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post("refresh")
    public async refresh(@Req() req: RequestAuthenticated): Promise<UserAuthenticate> {
        return this.authService.refreshToken(req.user.id);
    }

    @LogOutDocumentation()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post("logout")
    public async logout(@Req() req: RequestAuthenticated): Promise<BasicResponseEntity> {
        await this.authService.singOut(req.user.id);

        return {
            code: 200,
            message: "Logged out successfully",
        };
    }
}
