import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../interfaces/auth.interface";
import { ConfigService } from "@nestjs/config";

import jwtConfig from "../../configs/jwt.config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    public constructor(private configService: ConfigService<typeof jwtConfig, true>) {
        const secret = configService.get<string>("jwt.secret", { infer: true });

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    public validate(payload: TokenPayload): TokenPayload {
        return payload;
    }
}
