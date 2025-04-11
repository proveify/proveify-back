import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserEntity } from "../../entities/user.entity";

export function GetUserProfileDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Get logged user information" }),
        ApiResponse({ status: 200, type: UserEntity, description: "User profile data" }),
        ApiResponse({ status: 401, description: "Unauthorized" }),
        ApiResponse({ status: 404, description: "User not found" }),
        ApiBearerAuth(),
    );
}
