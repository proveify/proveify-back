import { IsEmail, IsInt, IsString } from "class-validator";

export class CreateDto {
    @IsString()
    public name: string;

    @IsInt()
    public user_type: number;

    @IsEmail()
    public email: string;

    @IsString()
    public password: string;
}

export class UpdateDto {
    @IsString()
    public name?: string;

    @IsEmail()
    public email?: string;

    @IsInt()
    public user_type?: number;

    @IsString()
    public password?: string;
}

export class UpdateAllDto extends UpdateDto {
    @IsString()
    public refresh_token?: string;
}
