import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ name: "BasicResponse" })
export class BasicResponseEntity {
    @ApiProperty({
        example: 200,
    })
    public code: number;

    @ApiProperty({
        example: "Register successfully",
    })
    public message: string;
}
