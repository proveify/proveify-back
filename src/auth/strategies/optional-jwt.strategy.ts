import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../interfaces/auth.interface";
import { ConfigService } from "@nestjs/config";
import jwtConfig from "../../common/jwt.config";
import { AuthContextService } from "../auth-context.service";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { UserService } from "@app/user/user.service";

@Injectable()
export class OptionalJwtStrategy extends PassportStrategy(Strategy, "optional-jwt") {
    public constructor(
        private moduleRef: ModuleRef,
        private configService: ConfigService<typeof jwtConfig, true>,
        private readonly userService: UserService,
    ) {
        const secret = configService.get<string>("jwt.secret", { infer: true });

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
            passReqToCallback: true,
        });
    }

    public async validate(request: Request, payload: TokenPayload): Promise<TokenPayload | null> {
        try {
            const contextId = ContextIdFactory.getByRequest(request);
            const authContextService = await this.moduleRef.resolve(AuthContextService, contextId);
            authContextService.setUser(await this.userService.getUserProfile(payload.id));
            return payload;
        } catch {
            // Si falla la validación, retorna null sin lanzar error
            return null;
        }
    }
}
