import { IsEmail, IsEnum, IsString } from "class-validator";
import { OmitType, PartialType, ApiProperty } from "@nestjs/swagger";
import { IdentificationTypes } from "../interfaces/users";

export class UserCreateDto {
    @ApiProperty()
    @IsString()
    public name: string;

    @ApiProperty()
    @IsString()
    public user_type: string;

    @ApiProperty()
    @IsEmail()
    public email: string;

    @ApiProperty()
    @IsString()
    public identification: string;

    @ApiProperty()
    @IsString()
    @IsEnum(IdentificationTypes)
    public identification_type: string;

    @ApiProperty()
    @IsString()
    public password: string;
}

export class UserUpdateDto extends PartialType(UserCreateDto) {
    @IsString()
    public refreshed_token?: string | null;
}

export class UserRegisterDto extends OmitType(UserCreateDto, ["user_type"] as const) {}
