import { IsObject, IsOptional, IsString } from "class-validator";
import { Prisma } from "@prisma/client";
import { IsFile, MemoryStoredFile } from "nestjs-form-data";
import { OmitType } from "@nestjs/mapped-types";

export class CreateDto {
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
    public user: Prisma.UsersCreateNestedOneWithoutProvidersInput;

    @IsOptional()
    @IsObject()
    public plan: Prisma.PlansCreateNestedOneWithoutProvidersInput;
}

export class RegisterDto extends OmitType(CreateDto, [
    "user",
    "plan",
    "chamber_commerce",
    "plan",
    "rut",
] as const) {
    @IsFile()
    public rut: MemoryStoredFile;

    @IsFile()
    public chamber_commerce: MemoryStoredFile;
}
