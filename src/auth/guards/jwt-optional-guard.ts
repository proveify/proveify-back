import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Injectable()
export class JwtOptionalGuard extends AuthGuard("jwt") {
    public constructor() {
        super();
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;

        if (authorization?.startsWith("Bearer ")) {
            return true;
        }

        try {
            const result = await super.canActivate(context);
            return result as boolean;
        } catch {
            throw new UnauthorizedException();
        }
    }
}
