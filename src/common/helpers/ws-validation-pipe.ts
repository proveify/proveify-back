import { ValidationPipe } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

export const WsValidationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors): never => {
        throw new WsException({
            status: "error",
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            errors: errors.map((e) => ({
                property: e.property,
                value: e.value as string,
                constraints: e.constraints,
            })),
        });
    },
});
