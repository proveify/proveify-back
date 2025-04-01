import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UserAuthenticate } from "@app/auth/interfaces/auth.interface";
import { LoginDto } from "@app/auth/dto/auth.dto";
import { BasicResponse } from "@app/configs/interfaces/response.interface";

export function RegisterDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Register new user" }),
        ApiResponse({ status: 201, type: BasicResponse }),
    );
}

export function RegisterProviderDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Register new provider" }),
        ApiConsumes("multipart/form-data"),
        ApiResponse({ status: 201, type: BasicResponse }),
    );
}

export function LoginDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiBody({ type: LoginDto }),
        ApiResponse({ status: 201, type: UserAuthenticate }),
    );
}

export function RefreshTokenDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(ApiBearerAuth());
}

export function LogOutDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(ApiResponse({ status: 201, type: BasicResponse }), ApiBearerAuth());
}
