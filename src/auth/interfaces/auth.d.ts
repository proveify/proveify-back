export interface UserAuthenticate {
    id: string;
    accessToken: string;
    refreshToken: string;
}

export interface TokenPayload {
    id: string;
}

export interface RefreshTokenPayload {
    id: string;
    refreshToken: string;
}
