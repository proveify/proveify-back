import { IsOptional } from "class-validator";
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";
import { ApiProperty, ApiSchema, OmitType, PartialType } from "@nestjs/swagger";
import { BaseUserDto } from "@app/common/dtos/base-user.dto";

@ApiSchema({ name: "ProviderCreate" })
export class ProviderCreateDto extends BaseUserDto {
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

export class ProviderUpdateWithoutFilesDto extends OmitType(ProviderUpdateDto, [
    "rut",
    "chamber_commerce",
    "profile_picture",
] as const) {}
