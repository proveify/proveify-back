import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Users as UserModel } from "@prisma/client";
import { RegisterUserDto } from "./dto/register.dto";
import { TokenPayload, UserAuthenticate } from "./interfaces/interfaces";
import { LocalAuthGuard } from "./guards/local.guard";
import { Request } from "express";

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
        return this.authService.singIn(req.user.id, req.user.email);
    }
}
