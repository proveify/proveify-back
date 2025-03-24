import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";

import type { TokenPayload } from "../interfaces/auth.interface";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
    public constructor(private moduleRef: ModuleRef) {
        super({
            usernameField: "email",
            passReqToCallback: true,
        });
    }

    public async validate(
        request: Request,
        email: string,
        password: string,
    ): Promise<TokenPayload> {
        const contextId = ContextIdFactory.getByRequest(request);
        const authService = await this.moduleRef.resolve(AuthService, contextId);

        const user = await authService.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException("Invalid credentials, check your email and password");
        }

        return {
            id: user.id,
        };
    }
}
