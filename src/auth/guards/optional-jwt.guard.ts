import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
    public canActivate(context: ExecutionContext): boolean {
        try {
            return super.canActivate(context) as boolean;
        } catch {
            return true;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public handleRequest(err: any, user: any): any {
        if (err || !user) {
            return null;
        }
        return user;
    }
}
