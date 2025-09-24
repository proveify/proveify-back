import type { HandshakeAuth, TypedSocket } from "@app/auth/interfaces/ws-auth.interface";
import { WsException } from "@nestjs/websockets";
import type { JwtService } from "@nestjs/jwt";
import type { TokenPayload } from "@app/auth/interfaces/auth.interface";
import type { Socket } from "socket.io";

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const WebsocketAuthMiddleware = (jwtService: JwtService): SocketMiddleware => {
    return (socket: TypedSocket, next) => {
        try {
            const token = extractTokenFromHandShake(socket);

            if (!token) {
                next(new WsException("Unauthorized"));
                return;
            }

            console.log(token);

            jwtService
                .verifyAsync<TokenPayload>(token)
                .then((payload) => {
                    socket.data.user = payload;
                    socket.data.joinedRooms = [];
                    next();
                })
                .catch(() => {
                    next(new WsException("Invalid token"));
                });
        } catch {
            next(new WsException("Invalid token"));
        }
    };
};

const extractTokenFromHandShake = (client: TypedSocket): string | null => {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) return authHeader.split(" ")[1];

    const authObject = client.handshake.auth;
    if (isHandshakeAuth(authObject) && authObject.token) return authObject.token;

    return null;
};

const isHandshakeAuth = (auth: unknown): auth is HandshakeAuth => {
    return (
        typeof auth === "object" &&
        auth !== null &&
        "token" in auth &&
        typeof (auth as Record<string, unknown>).token === "string" &&
        (auth as Record<string, unknown>).token !== ""
    );
};
