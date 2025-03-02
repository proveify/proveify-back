import { IsEmail, IsOptional, IsString } from "class-validator";
import { OmitType, PartialType } from "@nestjs/mapped-types";

export class CreateDto {
    @IsString()
    public name: string;

    @IsString()
    public user_type: string;

    @IsEmail()
    public email: string;

    @IsString()
    public identification: string;

    @IsString()
    public identification_type: string;

    @IsString()
    public password: string;
}

export class RegisterDto extends OmitType(CreateDto, ["user_type"] as const) {}

export class UpdateDto extends PartialType(CreateDto) {
    @IsOptional()
    @IsString()
    public refreshed_token?: string | null;
}
