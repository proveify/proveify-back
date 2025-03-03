import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Providers as ProviderModel, Users as UserModel } from "@prisma/client";
import { TokenPayload, UserAuthenticate } from "./interfaces/auth.interface";
import { LocalAuthGuard } from "./guards/local.guard";
import { Request } from "express";
import { RefreshJwtAuthGuard } from "./guards/refresh-jwt.guard";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { FormDataRequest } from "nestjs-form-data";
import { RegisterDto as UserRegisterDto, CreateDto as UserCreateDto } from "@app/user/dto/user.dto";
import { RegisterDto as ProviderRegisterDto } from "@app/provider/dto/provider.dto";
import { UserTypes } from "@app/user/interfaces/users";

@Controller("auth")
export class AuthController {
    public constructor(private authService: AuthService) {}

    @Post("register")
    public async register(@Body() data: UserRegisterDto): Promise<UserModel> {
        const userDto: UserCreateDto = Object.assign({}, data, { user_type: UserTypes.CLIENT });
        return await this.authService.createUser(userDto);
    }

    @Post("register/provider")
    @FormDataRequest()
    public async registerProvider(@Body() data: ProviderRegisterDto): Promise<ProviderModel> {
        return await this.authService.createProvider(data);
    }

    @UseGuards(LocalAuthGuard)
    @Post("login")
    public async login(@Req() req: Request & { user: TokenPayload }): Promise<UserAuthenticate> {
        return this.authService.singIn(req.user.id);
    }

    @UseGuards(RefreshJwtAuthGuard)
    @Post("refresh")
    public async refresh(@Req() req: Request & { user: TokenPayload }): Promise<UserAuthenticate> {
        return this.authService.refreshToken(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post("logout")
    public async logout(@Req() req: Request & { user: TokenPayload }): Promise<string> {
        await this.authService.singOut(req.user.id);
        return "Logged out successfully";
    }
}
