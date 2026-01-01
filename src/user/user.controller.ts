import { Body, Controller, Get, Put, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { ApiTags } from "@nestjs/swagger";
import { RequestAuthenticated } from "@app/auth/interfaces/auth.interface";
import {
    GetUserProfileDocumentation,
    UpdateUserDocumentation,
} from "./decorators/documentations/user.documentation";
import { UserEntity } from "./entities/user.entity";
import { UserUpdateDto, UserUpdateProfilePicture } from "@app/user/dto/user.dto";
import { LoadUser } from "@app/common/decorators/load-user.decorator";
import { OwnerSerializerInterceptor } from "@app/common/interceptors/owner-serializer.interceptor";

@ApiTags("Users")
@Controller("users")
@UseInterceptors(OwnerSerializerInterceptor)
export class UserController {
    public constructor(private readonly userService: UserService) {}

    @Get("profile")
    @UseGuards(JwtAuthGuard)
    @GetUserProfileDocumentation()
    @LoadUser()
    public async getUserProfile(@Req() req: RequestAuthenticated): Promise<UserEntity> {
        return await this.userService.getUserProfile(req.user.id, true);
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    @UpdateUserDocumentation()
    @LoadUser()
    public async updateUser(@Body() data: UserUpdateDto): Promise<UserEntity> {
        return this.userService.updateWithProviderData(data);
    }

    @Put("profile-picture")
    @UseGuards(JwtAuthGuard)
    @LoadUser()
    public async upProfilePicture(@Body() data: UserUpdateProfilePicture): Promise<UserEntity> {
        return this.userService.upProfilePicture(data);
    }
}
