import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Users as UserModel } from "@prisma/client";
import { RegisterUserDto } from "./dto/register.dto";
import { UserAuthenticate } from "./interfaces/interfaces";
import { LocalAuthGuard } from "./guards/local.guard";

@Controller("auth")
export class AuthController {
    public authService: AuthService;

    public constructor(authService: AuthService) {
        this.authService = authService;
    }

    @Post("register")
    public async register(@Body() data: RegisterUserDto): Promise<UserModel> {
        return await this.authService.createUser(data);
    }

    @UseGuards(LocalAuthGuard)
    @Post("login")
    public login(@Req() req: { user: UserAuthenticate }): UserAuthenticate {
        return req.user;
    }
}
