import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserAuthenticateEntity {
    @ApiProperty({
        example: "8afdf46b-6a83-4935-9768-f95dec637823",
        description: "User ID",
    })
    @Expose()
    public id: string;

    @ApiProperty({
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        description: "JWT access token",
    })
    @Expose()
    public accessToken: string;

    @ApiProperty({
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        description: "JWT refresh token",
    })
    @Expose()
    public refreshToken: string;

    public constructor(partial: Partial<UserAuthenticateEntity>) {
        Object.assign(this, partial);
    }
}
