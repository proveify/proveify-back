import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../interfaces/interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    public constructor() {
        if (!process.env.JWT_SECRET) throw new Error("SECRET is not defined");

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    public validate(payload: TokenPayload): TokenPayload {
        return payload;
    }
}
