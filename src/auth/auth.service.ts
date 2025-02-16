import { UserDto } from "@app/user/dto/user.dto";
import { UserService } from "@app/user/user.service";
import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Users as UserModel } from "@prisma/client";
import { RegisterUserDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { TokenPayload, UserAuthenticate } from "./interfaces/interfaces";
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
    private userService: UserService;
    private jwtService: JwtService;

    public constructor(userService: UserService, jwtService: JwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public async createUser(data: RegisterUserDto): Promise<UserModel> {
        const userTypeId = UserService.getUserTypeIdByKey(UserService.CLIENT_TYPE_KEY);

        if (!userTypeId) {
            throw new HttpException("User type not found", 400);
        }

        const passwordHashed = await this.generatePasswordHash(data.password);

        const userData: UserDto = {
            name: data.name,
            email: data.email,
            password: passwordHashed,
            user_type: userTypeId,
        };

        return this.userService.saveUser(userData);
    }

    public async authenticate({ email, password }: LoginDto): Promise<UserAuthenticate> {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException("Invalid credentials, check your email and password");
        }

        return await this.singIn(user);
    }

    public async singIn(user: UserModel): Promise<UserAuthenticate> {
        const tokenPayload: TokenPayload = { id: user.id, email: user.email };
        const accessToken = await this.jwtService.signAsync(tokenPayload);

        return {
            id: user.id,
            email: user.email,
            token: accessToken,
        };
    }

    public async validateUser(email: string, password: string): Promise<UserModel | false> {
        const user = await this.userService.findUserOneByEmail(email);

        if (!user) {
            return false;
        }

        const isMatch = await this.validatePassword(password, user.password);

        if (!isMatch) {
            return false;
        }

        return user;
    }

    public async generatePasswordHash(password: string): Promise<string> {
        return argon2.hash(password);
    }

    public async validatePassword(password: string, hash: string): Promise<boolean> {
        return argon2.verify(hash, password);
    }
}
