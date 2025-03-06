import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty()
    @IsString()
    public email: string;

    @ApiProperty()
    @IsString()
    public password: string;
}
