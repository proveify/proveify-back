import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Req,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import { GetUserProfileDocumentation } from "./decorators/documentations/user.documentation";
import { UserEntity } from "./entities/user.entity";

@ApiTags("Users")
@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
    public constructor(private readonly userService: UserService) {}

    @Get("profile")
    @UseGuards(JwtAuthGuard)
    @GetUserProfileDocumentation()
    public async getUserProfile(@Req() req: Request & { user: TokenPayload }): Promise<UserEntity> {
        return await this.userService.getUserProfile(req.user.id);
    }
}
