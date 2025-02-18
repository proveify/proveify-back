export interface UserAuthenticate {
    id: string;
    email: string;
    token: string;
}

export interface TokenPayload {
    id: string;
    email: string;
}

export interface RefreshTokenPayload {
    id: string;
    email: string;
    refreshToken: string;
}
