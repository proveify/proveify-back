import type { TypedSocket } from "@app/auth/interfaces/ws-auth.interface";
import { WebsocketJwtGuard } from "@app/auth/guards/websocket-jwt.guard";
import { WsException } from "@nestjs/websockets";
import type { JwtService } from "@nestjs/jwt";
import type { TokenPayload } from "@app/auth/interfaces/auth.interface";
import type { Socket } from "socket.io";

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const WebsocketAuthMiddleware = (jwtService: JwtService): SocketMiddleware => {
    return (socket: TypedSocket, next) => {
        try {
            const token = WebsocketJwtGuard.extractTokenFromHandShake(socket);

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
