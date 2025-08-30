import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({
        example: "my-email@gmail.com",
    })
    @IsString()
    public email: string;

    @ApiProperty({
        example: "qV5GMGwNKHGC3KB",
    })
    @IsString()
    public password: string;
}
