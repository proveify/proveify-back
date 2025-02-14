import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Users as UserModel } from "@prisma/client";
import { RegisterUserDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserAuthenticate } from "./interfaces/interfaces";

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

    @Post("login")
    public async login(@Body() data: LoginDto): Promise<UserAuthenticate> {
        return await this.authService.authenticate(data);
    }
}
