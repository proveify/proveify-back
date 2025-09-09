import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { PartialType, ApiProperty, ApiSchema } from "@nestjs/swagger";
import { IdentificationTypes } from "../interfaces/users";

@ApiSchema({ name: "UserCreate" })
export class UserCreateDto {
    @ApiProperty({
        example: "John Doe",
        description: "user name",
    })
    @IsString()
    public name: string;

    @ApiProperty({
        example: "john.doe@example.com",
        description: "user email address",
    })
    @IsEmail()
    public email: string;

    @ApiProperty({
        example: "123456789",
        description: "User identification number",
    })
    @IsString()
    public identification: string;

    @ApiProperty({
        example: "CC",
        description: "Type of identification document",
        enum: IdentificationTypes,
    })
    @IsString()
    @IsEnum(IdentificationTypes)
    public identification_type: string;

    @ApiProperty({
        example: "mySecurePassword123",
        description: "User password",
    })
    @IsString()
    public password: string;

    @ApiProperty({
        example: "+1234567890",
        description: "User phone number",
        required: false,
    })
    @IsString()
    @IsOptional()
    public phone?: string;
}

export class UserUpdateDto extends PartialType(UserCreateDto) {}
