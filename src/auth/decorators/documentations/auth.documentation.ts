import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserAuthenticate } from "@app/auth/interfaces/auth.interface";
import { LoginDto } from "@app/auth/dto/auth.dto";

export function LoginDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiBody({ type: LoginDto }),
        ApiOperation({ summary: "Login" }),
        ApiResponse({ status: 200, type: UserAuthenticate }),
    );
}
