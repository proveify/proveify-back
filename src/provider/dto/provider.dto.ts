import { IsObject, IsOptional } from "class-validator";
import { Prisma } from "@prisma/client";
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { UserRegisterDto } from "@app/user/dto/user.dto";

export class ProviderCreateDto extends IntersectionType(UserRegisterDto) {
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

    @IsOptional()
    @IsObject()
    public user: Prisma.UsersCreateNestedOneWithoutProviderInput;

    @IsOptional()
    @IsObject()
    public plan: Prisma.PlansCreateNestedOneWithoutProvidersInput;

    @IsFile()
    @IsOptional()
    @HasMimeType(["image/jpeg", "image/png"])
    public profile_picture?: MemoryStoredFile;
}

export class ProviderUpdateDto extends PartialType(ProviderCreateDto) {}
