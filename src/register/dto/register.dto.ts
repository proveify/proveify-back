import { IsString, IsEmail, IsInt } from "class-validator";

export class RegisterUserDto {
    @IsString()
    public name: string;

    @IsEmail()
    public email: string;

    @IsString()
    public password: string;

    @IsInt()
    public user_type?: number;
}
