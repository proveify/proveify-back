import { IsString, IsEmail } from "class-validator";

export class RegisterUserDto {
    @IsString()
    public name: string;

    @IsEmail()
    public email: string;

    @IsString()
    public identification: string;

    @IsString()
    public identification_type: string;

    @IsString()
    public password: string;
}
