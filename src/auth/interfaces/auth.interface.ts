import { ApiProperty } from "@nestjs/swagger";
import { Request } from "express";

export class UserAuthenticate {
    @ApiProperty({
        example: "8afdf46b-6a83-4935-9768-f95dec637823",
        description: "User ID",
    })
    public id: string;

    @ApiProperty({
        example:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhhZmRmNDZiLTZhODMtNDkzNS05NzY4LWY5NWRlYzYzNzgyMyIsImlhdCI6MTc1NTk4OTYzMiwiZXhwIjoxNzU1OTkwMjMyfQ._BMUtMnab3m1Twn0b1yoBMc6iBP2owlUPiZNxtYi2aA",
        description: "JWT access token",
    })
    public accessToken: string;

    @ApiProperty({
        example:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhhZmRmNDZiLTZhODMtNDkzNS05NzY4LWY5NWRlYzYzNzgyMyIsImlhdCI6MTc1NTk4OTYzMiwiZXhwIjoxNzU1OTkxNDMyfQ.JGnwgy4XCCbyxAI2nFNlkxlsG5vbxuz59zgyhguLr_k",
        description: "JWT refresh token",
    })
    public refreshToken: string;
}

export class TokenPayload {
    public id: string;
}

export class RefreshTokenPayload {
    public id: string;

    public refreshToken: string;
}

export type RequestAuthenticated = Request & { user: TokenPayload };
