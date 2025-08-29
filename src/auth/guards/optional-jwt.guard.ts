import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenPayload } from "../interfaces/auth.interface";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("optional-jwt") {
    public canActivate(context: ExecutionContext): boolean {
        try {
            return super.canActivate(context) as boolean;
        } catch {
            return true;
        }
    }

    public handleRequest<TUser = TokenPayload | null>(
        err: Error | null,
        user: TUser,
    ): TUser | null {
        if (err || !user) {
            return null as TUser | null;
        }
        return user;
    }
}
