import type { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
    type ClassTransformOptions,
    plainToInstance,
    type ClassConstructor,
} from "class-transformer";

interface SerializeOptions {
    groups?: string[];
}

function isValidClassInstance(
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

export class CustomSerializerInterceptor implements NestInterceptor {
    public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(
            map((data: unknown) => {
                if (Array.isArray(data)) {
                    return data.map((item) => this.transformItem(item));
                }

                return this.transformItem(data);
            }),
        );
    }

    private transformItem(item: unknown): unknown {
        if (!item || typeof item !== "object" || !isValidClassInstance(item)) {
            return item;
        }

        const serializeOptions = Reflect.getMetadata("custom:serialize-options", item) as
            | SerializeOptions
            | undefined;

        if (serializeOptions?.groups) {
            const transformOptions: ClassTransformOptions = {
                groups: serializeOptions.groups,
                excludeExtraneousValues: false,
            };

            return plainToInstance(item.constructor, item, transformOptions);
        }

        return plainToInstance(item.constructor, item, {
            excludeExtraneousValues: false,
        });
    }
}
