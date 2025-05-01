import { Type } from "class-transformer";
import {
    ArrayMinSize,
    IsDecimal,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import { IsFile, MemoryStoredFile } from "nestjs-form-data";

export class QuoteDto {
    @IsString()
    public identification_type: string;

    @IsString()
    public identification: string;

    @IsString()
    public name: string;

    @IsString()
    public email: string;

    @IsString()
    public provider_id: string;

    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => QuoteProviderDto)
    public quotes: QuoteProviderDto[];
}

export class QuoteProviderDto {
    @IsString()
    public provider_id: string;

    @IsString()
    @IsOptional()
    public description: string;

    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => QuoteItemDto)
    public quotes: QuoteItemDto[];
}

export class QuoteItemDto {
    @IsString()
    public item_id: string;

    @IsInt()
    public quantity: number;

    @IsDecimal({ decimal_digits: "2" })
    @IsOptional()
    public price: number | undefined;

    @IsString()
    public name: string;

    @IsString()
    @IsOptional()
    public description: string | undefined;

    @IsNumber()
    @IsOptional()
    public discount: number | undefined;
}

export class QuoteUploadFileDto {
    @IsFile()
    public file: MemoryStoredFile;
}
