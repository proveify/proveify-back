import { PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, IsDecimal } from "class-validator";
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";

export class ItemCreateDto {
    @IsString()
    public name: string;

    @IsOptional()
    @IsString()
    public description?: string;

    @IsDecimal({ decimal_digits: "2" })
    public price: number;

    @IsOptional()
    @IsFile()
    @HasMimeType(["application/jpeg", "image/png"])
    public image?: MemoryStoredFile;
}

export class ItemUpdateDto extends PartialType(ItemCreateDto) {}
