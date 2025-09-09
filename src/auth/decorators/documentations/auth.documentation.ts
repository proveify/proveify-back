import { applyDecorators } from "@nestjs/common";
import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiBearerAuth,
    ApiOkResponse,
    ApiCreatedResponse,
} from "@nestjs/swagger";
import { LoginDto } from "@app/auth/dto/auth.dto";
import { BasicResponseEntity } from "@app/common/entities/response.entity";

export function RegisterDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Register new user" }),
        ApiCreatedResponse({ type: BasicResponseEntity }),
    );
}

export function RegisterProviderDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Register new provider" }),
        ApiConsumes("multipart/form-data"),
        ApiCreatedResponse({ type: BasicResponseEntity }),
    );
}

export function LoginDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(ApiBody({ type: LoginDto }));
}

export function RefreshTokenDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(ApiBearerAuth());
}

export function LogOutDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(ApiOkResponse({ type: BasicResponseEntity }), ApiBearerAuth());
}
