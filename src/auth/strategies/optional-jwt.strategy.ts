import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../interfaces/auth.interface";
import { ConfigService } from "@nestjs/config";
import jwtConfig from "../../common/jwt.config";

@Injectable()
export class OptionalJwtStrategy extends PassportStrategy(Strategy, "optional-jwt") {
    public constructor(private configService: ConfigService<typeof jwtConfig, true>) {
        const secret = configService.get<string>("jwt.secret", { infer: true });

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    public validate(payload: TokenPayload): TokenPayload | null {
        return payload;
    }
}
