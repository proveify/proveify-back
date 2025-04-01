import { ApiProperty } from "@nestjs/swagger";

export class BasicResponseEntity {
    @ApiProperty()
    public code: number;

    @ApiProperty()
    public message: string;
}
