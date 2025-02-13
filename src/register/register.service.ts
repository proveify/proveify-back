import { Injectable } from "@nestjs/common";
import { RegisterUserDto } from "./dto/register.dto";
import { UserDto } from "@app/user/dto/user.dto";

@Injectable()
export class RegisterService {
    /**
     * contains CLIENT as default user_type value
     */
    private static defaultUserTypeId = 1;

    public generateUserDto(data: RegisterUserDto): UserDto {
        const userData: UserDto = {
            name: data.name,
            email: data.email,
            password: data.password,
            user_type: data.user_type ?? RegisterService.defaultUserTypeId,
        };

        return userData;
    }
}
