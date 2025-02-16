export interface UserAuthenticate {
    id: string;
    email: string;
    token: string;
}

export interface TokenPayload {
    id: string;
    email: string;
}
