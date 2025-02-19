import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Users as UserModel } from "@prisma/client";
import { RegisterUserDto } from "./dto/register.dto";
import { TokenPayload, UserAuthenticate } from "./interfaces/interfaces";
import { LocalAuthGuard } from "./guards/local.guard";
import { Request } from "express";
import { RefreshJwtAuthGuard } from "./guards/refresh-jwt.guard";
import { JwtAuthGuard } from "./guards/jwt.guard";

@Controller("auth")
export class AuthController {
    public constructor(private authService: AuthService) {}

    @Post("register")
    public async register(@Body() data: RegisterUserDto): Promise<UserModel> {
        return await this.authService.createUser(data);
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
