import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ClsService } from "nestjs-cls";
import { UserService } from "@app/user/user.service";
import { LOAD_USER_KEY } from "@app/common/decorators/load-user.decorator";
import { Request } from "express";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import { Observable } from "rxjs";

@Injectable()
export class LoadUserInterceptor implements NestInterceptor {
    public constructor(
        private reflector: Reflector,
        private cls: ClsService,
        private userService: UserService,
    ) {}

    public async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<void>> {
        const shouldLoudUser = this.reflector.getAllAndOverride<boolean>(LOAD_USER_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (shouldLoudUser) {
            const request: Request & { user?: TokenPayload } = context.switchToHttp().getRequest();

            if (request.user) {
                const user = await this.userService.getUserProfile(request.user.id);
                this.cls.set("user", user);
            }
        }

        return next.handle();
    }
}
