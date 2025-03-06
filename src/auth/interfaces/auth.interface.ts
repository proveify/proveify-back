import { ApiProperty } from "@nestjs/swagger";

export class UserAuthenticate {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public accessToken: string;

    @ApiProperty()
    public refreshToken: string;
}

export class TokenPayload {
    @ApiProperty()
    public id: string;
}

export class RefreshTokenPayload {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public refreshToken: string;
}
