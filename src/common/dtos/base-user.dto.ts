import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { IdentificationTypes } from "@app/user/interfaces/users";
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";

export class BaseUserDto {
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

    @ApiProperty({
        description: "Debe ser un archivo en formato JPEG o PNG.",
        type: "string",
        format: "binary",
    })
    @IsFile()
    @IsOptional()
    @HasMimeType(["image/jpeg", "image/png"])
    public profile_picture?: MemoryStoredFile;
}
