import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { TokenPayload, UserAuthenticate } from "./interfaces/auth.interface";
import { LocalAuthGuard } from "./guards/local.guard";
import { Request } from "express";
import { RefreshJwtAuthGuard } from "./guards/refresh-jwt.guard";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { FormDataRequest } from "nestjs-form-data";
import {
    UserRegisterDto as UserRegisterDto,
    UserCreateDto as UserCreateDto,
} from "@app/user/dto/user.dto";
import { ProviderRegisterDto as ProviderRegisterDto } from "@app/provider/dto/provider.dto";
import { UserTypes } from "@app/user/interfaces/users";
import { ApiTags } from "@nestjs/swagger";
import {
    LoginDocumentation,
    LogOutDocumentation,
    RefreshTokenDocumentation,
    RegisterDocumentation,
    RegisterProviderDocumentation,
} from "@app/auth/decorators/documentations/auth.documentation";
import { BasicResponse } from "@root/configs/interfaces/response.interface";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    public constructor(private authService: AuthService) {}

    @RegisterDocumentation()
    @Post("register")
    public async register(@Body() data: UserRegisterDto): Promise<BasicResponse> {
        const userDto: UserCreateDto = Object.assign({}, data, { user_type: UserTypes.CLIENT });
        await this.authService.createUser(userDto);

        return {
            code: 200,
            message: "Register successfully",
        };
    }

    @RegisterProviderDocumentation()
    @Post("register/provider")
    @FormDataRequest()
    public async registerProvider(@Body() data: ProviderRegisterDto): Promise<BasicResponse> {
        await this.authService.createProvider(data);

        return {
            code: 200,
            message: "Register successfully",
        };
    }

    @LoginDocumentation()
    @UseGuards(LocalAuthGuard)
    @Post("login")
    public async login(@Req() req: Request & { user: TokenPayload }): Promise<UserAuthenticate> {
        return this.authService.singIn(req.user.id);
    }

    @RefreshTokenDocumentation()
    @UseGuards(RefreshJwtAuthGuard)
    @Post("refresh")
    public async refresh(@Req() req: Request & { user: TokenPayload }): Promise<UserAuthenticate> {
        return this.authService.refreshToken(req.user.id);
    }

    @LogOutDocumentation()
    @UseGuards(JwtAuthGuard)
    @Post("logout")
    public async logout(@Req() req: Request & { user: TokenPayload }): Promise<BasicResponse> {
        await this.authService.singOut(req.user.id);

        return {
            code: 200,
            message: "Logged out successfully",
        };
    }
}
