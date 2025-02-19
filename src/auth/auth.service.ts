import { CreateDto as UserCreateDto } from "@app/user/dto/user.dto";
import { UserService } from "@app/user/user.service";
import { HttpException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Users as UserModel } from "@prisma/client";
import { RegisterUserDto } from "./dto/register.dto";
import { TokenPayload, UserAuthenticate } from "./interfaces/interfaces";
import { ConfigType } from "@nestjs/config";

import * as argon2 from "argon2";
import refreshJwtConfig from "./config/refresh-jwt-config";
import { ParameterService } from "@app/parameter/parameter.service";

@Injectable()
export class AuthService {
    public constructor(
        private userService: UserService,
        private parameterService: ParameterService,
        private jwtService: JwtService,
        @Inject(refreshJwtConfig.KEY)
        private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    ) {}

    public async createUser(data: RegisterUserDto): Promise<UserModel> {
        const userType = this.parameterService.getUserTypeByKey(UserService.CLIENT_TYPE_KEY);

        if (!userType) throw new HttpException("User type not found", 400);

        const passwordHashed = await this.generatePasswordHash(data.password);
        const identificationType = this.parameterService.getIdentificationTypeByKey(
            data.identification_type,
        );

        if (!identificationType) throw new HttpException("Identification type not found", 400);

        const userData: UserCreateDto = {
            name: data.name,
            email: data.email,
            identification: data.identification,
            identification_type: identificationType.id,
            password: passwordHashed,
            user_type: userType.id,
        };

        return this.userService.saveUser(userData);
    }

    public async singIn(id: string): Promise<UserAuthenticate> {
        const tokenPayload: TokenPayload = { id };
        const { accessToken, refreshToken } = await this.generateTokens(tokenPayload);
        await this.saveRefreshedToken(id, refreshToken);

        return {
            id,
            accessToken,
            refreshToken,
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

    public async generateTokens(
        payload: TokenPayload,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshJwtConfiguration),
        ]);

        return { accessToken, refreshToken };
    }

    public async refreshToken(id: string): Promise<UserAuthenticate> {
        const { accessToken, refreshToken } = await this.generateTokens({ id: id });
        await this.saveRefreshedToken(id, refreshToken);

        return {
            id,
            accessToken,
            refreshToken,
        };
    }

    public async validateRefreshJwt(id: string, refreshToken: string): Promise<string> {
        const user = await this.userService.findUserOneById(id);

        if (!user?.refreshed_token) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const isMatch = await argon2.verify(user.refreshed_token, refreshToken);

        if (!isMatch) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        return user.id;
    }

    public async saveRefreshedToken(id: string, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await argon2.hash(refreshToken);
        await this.userService.update(id, { refreshed_token: hashedRefreshToken });
    }

    public async singOut(id: string): Promise<void> {
        await this.userService.update(id, { refreshed_token: null });
    }
}
