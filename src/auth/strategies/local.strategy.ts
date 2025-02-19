import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";

import type { TokenPayload } from "../interfaces/interfaces";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    public constructor(private authService: AuthService) {
        super({
            usernameField: "email",
        });
    }

    public async validate(email: string, password: string): Promise<TokenPayload> {
        const user = await this.authService.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException("Invalid credentials, check your email and password");
        }

        return {
            id: user.id,
        };
    }
}
