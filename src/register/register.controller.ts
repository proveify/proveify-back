import { Body, Controller, HttpException, Post } from "@nestjs/common";
import { RegisterService } from "./register.service";
import { UserService } from "@app/user/user.service";
import { UserDto } from "@app/user/dto/user.dto";
import { RegisterUserDto } from "./dto/register.dto";
import { Users as UserModel } from "@prisma/client";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("register")
@Controller("register")
export class RegisterController {
    public registeService: RegisterService;
    public userService: UserService;

    public constructor(registerService: RegisterService, userService: UserService) {
        this.registeService = registerService;
        this.userService = userService;
    }

    @Post()
    public async register(@Body() data: RegisterUserDto): Promise<UserModel> {
        data.user_type = UserService.getUserTypeIdByKey(UserService.CLIENT_TYPE_KEY);

        if (data.user_type === undefined) {
            throw new HttpException("User type not found", 404);
        }

        const userData: UserDto = data as UserDto;
        return this.userService.createUser(userData);
    }
}
