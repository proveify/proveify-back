import { IsObject, IsOptional, IsString } from "class-validator";
import { Prisma } from "@prisma/client";
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { UserRegisterDto } from "@app/user/dto/user.dto";

export class ProviderCreateDto {
    @IsString()
    public name: string;

    @IsString()
    public email: string;

    @IsString()
    public rut: string;

    @IsString()
    public chamber_commerce: string;

    @IsString()
    public identification: string;

    @IsString()
    public identification_type: string;

    @IsOptional()
    @IsObject()
    public user: Prisma.UsersCreateNestedOneWithoutProviderInput;

    @IsOptional()
    @IsObject()
    public plan: Prisma.PlansCreateNestedOneWithoutProvidersInput;
}

export class ProviderRegisterDto extends IntersectionType(UserRegisterDto) {
    @ApiProperty({
        description: "Debe ser un archivo en formato PDF.",
        type: "string",
        format: "binary",
    })
    @IsFile()
    @HasMimeType(["application/pdf"])
    public rut: MemoryStoredFile;

    @ApiProperty({
        description: "Debe ser un archivo en formato PDF.",
        type: "string",
        format: "binary",
    })
    @IsFile()
    @HasMimeType(["application/pdf"])
    public chamber_commerce: MemoryStoredFile;
}

export class ProviderUpdateDto extends PartialType(ProviderRegisterDto) {}
