import { ApiProperty } from "@nestjs/swagger";

export class BasicResponse {
    @ApiProperty()
    public code: number;

    @ApiProperty()
    public message: string;
}
