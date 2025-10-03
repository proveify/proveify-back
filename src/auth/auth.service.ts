import { UserCreateDto as UserCreateDto } from "@app/user/dto/user.dto";
import { UserService } from "@app/user/user.service";
import { HttpException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, Providers as ProviderModel } from "@prisma/client";
import { TokenPayload, UserAuthenticate } from "./interfaces/auth.interface";
import { ConfigType } from "@nestjs/config";
import { PlanService } from "@app/plan/plan.service";
import { ProviderService } from "@app/provider/provider.service";
import { FileService } from "@app/file/file.service";
import { PlanTypes } from "@app/plan/interfaces/plan.interface";
import { UserTypes } from "@app/user/interfaces/users";

import { ProviderCreateDto } from "@app/provider/dto/provider.dto";

import * as argon2 from "argon2";
import refreshJwtConfig from "@app/common/refresh-jwt-config";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";
import { AuthContextService } from "./auth-context.service";
import { UserEntity } from "@app/user/entities/user.entity";

@Injectable()
export class AuthService {
    public constructor(
        private userService: UserService,
        private authContextService: AuthContextService,
        private planService: PlanService,
        private providerService: ProviderService,
        private fileService: FileService,
        private jwtService: JwtService,
        @Inject(refreshJwtConfig.KEY)
        private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    ) {}

    public async createUser(data: Prisma.UsersCreateInput): Promise<UserEntity> {
        data.password = await this.generatePasswordHash(data.password);
        const user = await this.userService.saveUser(data);
        this.authContextService.setUser(user);

        return user;
    }

    public async createClient(data: UserCreateDto): Promise<UserEntity> {
        const user = await this.userService.findUserOneByEmail(data.email);

        if (user) {
            throw new HttpException("Email already used", 400);
        }

        const userData: Prisma.UsersCreateInput = Object.assign({}, data, {
            user_type: UserTypes.CLIENT,
        });

        return await this.createUser(userData);
    }

    public async createProvider(data: ProviderCreateDto): Promise<ProviderModel> {
        const { rut, chamber_commerce, ...fields } = data;
        const userData: Prisma.UsersCreateInput = Object.assign({}, fields, {
            user_type: UserTypes.PROVIDER,
        });

        const user = await this.createUser(userData);
        const plan = await this.planService.getPlanByKey(PlanTypes.NONE);

        const [rutFileData, chamberCommerceFileData] = await Promise.all([
            this.fileService.save(rut, ResourceType.RUT),
            this.fileService.save(chamber_commerce, ResourceType.CHAMBER_COMMERCE),
        ]);

        const providerData: Prisma.ProvidersCreateInput = {
            name: user.name,
            identification: user.identification,
            identification_type: user.identification_type,
            email: user.email,
            rut: rutFileData.id,
            chamber_commerce: chamberCommerceFileData.id,
            user: {
                connect: {
                    id: user.id,
                },
            },
            plan: {
                connect: {
                    id: plan.id,
                },
            },
        };

        return this.providerService.saveProvider(providerData);
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

    public async validateUser(email: string, password: string): Promise<UserEntity | false> {
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
        const user = await this.userService.findUserOneById({ id });

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
