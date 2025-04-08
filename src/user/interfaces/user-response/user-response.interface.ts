import { ApiProperty } from "@nestjs/swagger";

export class UserResponse {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public name: string;

    @ApiProperty()
    public email: string;

    @ApiProperty()
    public identification: string;

    @ApiProperty()
    public identification_type: string;

    @ApiProperty()
    public created_at: Date;

    @ApiProperty()
    public updated_at: Date;
}
