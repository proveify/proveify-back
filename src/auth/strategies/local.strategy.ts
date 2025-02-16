import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

import type { AuthService } from "../auth.service";
import type { UserAuthenticate } from "../interfaces/interfaces";

export class LocalStrategy extends PassportStrategy(Strategy) {
    private authService: AuthService;

    public constructor(authService: AuthService) {
        super();
        this.authService = authService;
    }

    public async validate(email: string, password: string): Promise<UserAuthenticate> {
        return this.authService.authenticate({ email, password });
    }
}
