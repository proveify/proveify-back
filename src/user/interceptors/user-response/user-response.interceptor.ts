import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

type DataRecord = Record<string, unknown>;

@Injectable()
export class UserResponseInterceptor implements NestInterceptor {
    public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(
            map((data: unknown) => {
                if (Array.isArray(data)) {
                    return data.map((item) => this.filterSensitiveData(item));
                }
                return this.filterSensitiveData(data);
            }),
        );
    }

    private filterSensitiveData(data: unknown): unknown {
        if (data !== null && typeof data === "object") {
            const filtered: DataRecord = { ...(data as DataRecord) };

            // Eliminar datos sensibles
            if ("password" in filtered) delete filtered.password;
            if ("refreshed_token" in filtered) delete filtered.refreshed_token;

            return filtered;
        }
        return data;
    }
}
