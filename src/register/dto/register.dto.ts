import { IsInt, IsString, IsEmail } from "class-validator";

export class RegisterUserDto {
    @IsString()
    public name: string;

    @IsInt()
    public user_type?: number;

    @IsEmail()
    public email: string;

    @IsString()
    public password: string;
}
