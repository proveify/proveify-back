import { UserDto } from "@app/user/dto/user.dto";
import { UserService } from "@app/user/user.service";
import { HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Users as UserModel } from "@prisma/client";
import { RegisterUserDto } from "./dto/register.dto";
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

    public async singIn(id: string, email: string): Promise<UserAuthenticate> {
        const tokenPayload: TokenPayload = { id, email };
        const accessToken = await this.jwtService.signAsync(tokenPayload);

        return {
            id,
            email,
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
