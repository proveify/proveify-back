import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigType } from "@nestjs/config";
import { Request } from "express";
import { RefreshTokenPayload, TokenPayload } from "../interfaces/auth";
import { AuthService } from "../auth.service";

import refreshJwtConfig from "../config/refresh-jwt-config";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh-jwt") {
    public constructor(
        @Inject(refreshJwtConfig.KEY)
        private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
        private authService: AuthService,
    ) {
        if (!refreshJwtConfiguration.secret) throw new Error("SECRET is not defined");

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: refreshJwtConfiguration.secret,
            ignoreExpiration: false,
            passReqToCallback: true,
        });
    }

    public async validate(req: Request, payload: TokenPayload): Promise<RefreshTokenPayload> {
        const refreshToken = req.get("Authorization")?.replace("Bearer", "").trim();
        if (!refreshToken) throw new UnauthorizedException("Bearer Token required");

        const id = await this.authService.validateRefreshJwt(payload.id, refreshToken);

        return { id, refreshToken };
    }
}
