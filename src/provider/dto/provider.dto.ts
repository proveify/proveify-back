import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { BaseUserDto } from "@app/common/dtos/base-user.dto";
import { IsOptional } from "class-validator";

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
}

export class ProviderUpdateDto {
    @ApiProperty({
        description: "Debe ser un archivo en formato PDF.",
        type: "string",
        format: "binary",
    })
    @IsFile()
    @HasMimeType(["application/pdf"])
    @IsOptional()
    public rut?: MemoryStoredFile;

    @ApiProperty({
        description: "Debe ser un archivo en formato PDF.",
        type: "string",
        format: "binary",
    })
    @IsFile()
    @HasMimeType(["application/pdf"])
    @IsOptional()
    public chamber_commerce?: MemoryStoredFile;
}
