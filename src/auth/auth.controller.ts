import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Users as UserModel } from "@prisma/client";
import { RegisterUserDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
    public authService: AuthService;

    public constructor(authService: AuthService) {
        this.authService = authService;
    }

    @Post("register")
    public async register(@Body() data: RegisterUserDto): Promise<UserModel> {
        return this.authService.createUser(data);
    }

    @Post("login")
    public async login(@Body() data: LoginDto): Promise<{ user: UserModel; token: string }> {
        return this.authService.authenticate(data);
    }
}
