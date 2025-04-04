import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { RefreshTokenPayload, TokenPayload } from "../interfaces/auth.interface";
import { AuthService } from "../auth.service";

import refreshJwtConfig from "../../configs/refresh-jwt-config";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh-jwt") {
    public constructor(
        private configService: ConfigService<typeof refreshJwtConfig, true>,
        private moduleRef: ModuleRef,
    ) {
        const refreshJwtSecret = configService.get<string>("refresh-jwt.secret", { infer: true });

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: refreshJwtSecret,
            ignoreExpiration: false,
            passReqToCallback: true,
        });
    }

    public async validate(req: Request, payload: TokenPayload): Promise<RefreshTokenPayload> {
        const contextId = ContextIdFactory.getByRequest(req);
        const authService = await this.moduleRef.resolve(AuthService, contextId);
        const refreshToken = req.get("Authorization")?.replace("Bearer", "").trim();
        if (!refreshToken) throw new UnauthorizedException("Bearer Token required");

        const id = await authService.validateRefreshJwt(payload.id, refreshToken);

        return { id, refreshToken };
    }
}
