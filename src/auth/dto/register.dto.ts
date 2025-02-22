import { IsString, IsEmail } from "class-validator";
import { FileSystemStoredFile, IsFile } from "nestjs-form-data";

export class RegisterUserDto {
    @IsString()
    public name: string;

    @IsEmail()
    public email: string;

    @IsString()
    public identification: string;

    @IsString()
    public identification_type: string;

    @IsString()
    public password: string;
}

export class RegisterProviderDto extends RegisterUserDto {
    @IsFile()
    public rut: FileSystemStoredFile;

    @IsFile()
    public chamber_commerce: FileSystemStoredFile;
}
