import { IsEmail, IsInt, IsString } from "class-validator";

export class UserDto {
    @IsString()
    public name: string;

    @IsInt()
    public user_type: number;

    @IsEmail()
    public email: string;

    @IsString()
    public password: string;
}
