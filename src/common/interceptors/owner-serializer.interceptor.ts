import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "@app/user/entities/user.entity";
import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { GroupDispatcher } from "@app/common/helpers/group-dispatcher";

@Injectable()
export class OwnerSerializerInterceptor implements NestInterceptor {
    private groupDispatcher: GroupDispatcher;

    public constructor(private readonly cls: ClsService) {
        const groupDispatcher = new GroupDispatcher();

        groupDispatcher.register(
            UserEntity,
            (item: UserEntity, currentUser: UserEntity): string[] => {
                return item.id === currentUser.id ? ["owner"] : [];
            },
        );

        groupDispatcher.register(
            ProviderEntity,
            (item: ProviderEntity, current: UserEntity): string[] => {
                return item.user_id === current.id ? ["owner"] : [];
            },
        );

        this.groupDispatcher = groupDispatcher;
    }

    public intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(map((data) => this.transformWithOwnership(data)));
    }

    private transformWithOwnership(item: unknown): unknown {
        if (!this.isValidClassInstance(item)) {
            return item;
        }

        if (Array.isArray(item)) {
            return item.map((element) => this.transformWithOwnership(element));
        }

        const user = this.cls.get<UserEntity | null>("user");
        const ctor = (item as { constructor: ClassConstructor<unknown> }).constructor;

        if (!user) {
            const instance = plainToInstance(ctor, item);
            return instanceToPlain(instance);
        }

        const groups: string[] = this.groupDispatcher.determine(item, user);
        const instance = plainToInstance(ctor, item, { groups: [...groups, "authenticated"] });
        return instanceToPlain(instance);
    }

    private isValidClassInstance(
        obj: unknown,
    ): obj is Record<string, unknown> & { constructor: ClassConstructor<unknown> } {
        return (
            obj !== null &&
            typeof obj === "object" &&
            "constructor" in obj &&
            typeof obj.constructor === "function" &&
            obj.constructor !== Object
        );
    }
}
