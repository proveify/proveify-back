import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigType } from "@nestjs/config";
import { Request } from "express";
import { RefreshTokenPayload, TokenPayload } from "../interfaces/interfaces";

import refreshJwtConfig from "../config/refresh-jwt-config";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh-jwt") {
    public constructor(
        @Inject(refreshJwtConfig.KEY)
        private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    ) {
        if (!refreshJwtConfiguration.secret) throw new Error("SECRET is not defined");

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: refreshJwtConfiguration.secret,
            ignoreExpiration: false,
            passReqToCallback: true,
        });
    }

    public validate(req: Request, payload: TokenPayload): RefreshTokenPayload {
        const refreshToken = req.get("Authorization")?.replace("Bearer", "").trim();

        if (!refreshToken) throw new UnauthorizedException("Bearer Token required");

        return { ...payload, refreshToken };
    }
}
