import { IsObject, IsOptional } from "class-validator";
import { Prisma } from "@prisma/client";
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";
import { ApiProperty, ApiSchema, IntersectionType, PartialType } from "@nestjs/swagger";
import { UserCreateDto } from "@app/user/dto/user.dto";

@ApiSchema({ name: "ProviderCreate" })
export class ProviderCreateDto extends IntersectionType(UserCreateDto) {
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

export class ProviderUpdateDto extends PartialType(ProviderCreateDto) {}
