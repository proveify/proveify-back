import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenPayload } from "../interfaces/auth.interface";
import { Request } from "express";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("optional-jwt") {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return true;
        }

        return super.canActivate(context) as Promise<boolean>;
    }

    public handleRequest<TUser = TokenPayload | null>(
        err: Error | null,
        user: TUser | false,
    ): TUser | null {
        if (err || user === false) {
            throw new UnauthorizedException("Invalid token");
        }

        return user ?? null;
    }
}
