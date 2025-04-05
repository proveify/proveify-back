import { Controller, Get, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserResponse } from "./interfaces/user-response/user-response.interface";
import { Request } from "express";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import { UserResponseInterceptor } from "./interceptors/user-response/user-response.interceptor";

@ApiTags("Users")
@Controller("users")
@UseInterceptors(UserResponseInterceptor)
export class UserController {
    public constructor(private readonly userService: UserService) {}

    @Get("profile")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get logged user information" })
    @ApiResponse({ status: 200, type: UserResponse, description: "User profile data" })
    public async getUserProfile(
        @Req() req: Request & { user: TokenPayload },
    ): Promise<UserResponse> {
        return await this.userService.getUserProfile(req.user.id);
    }
}
