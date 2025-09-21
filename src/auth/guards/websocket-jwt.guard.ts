import type { JwtService } from "@nestjs/jwt";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { HandshakeAuth, TypedSocket } from "@app/auth/interfaces/ws-auth.interface";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WebsocketJwtGuard implements CanActivate {
    public constructor(private readonly jwtService: JwtService) {}

    public canActivate(context: ExecutionContext): boolean {
        if (context.getType() !== "ws") {
            throw new WsException("Invalid context type");
        }

        const client = context.switchToWs().getClient<TypedSocket>();
        const user: unknown = client.handshake.auth.user;

        if (!user) {
            throw new WsException("Unauthorized");
        }

        return true;
    }

    public static extractTokenFromHandShake(client: TypedSocket): string | null {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) return authHeader.split(" ")[1];

        const authObject = client.handshake.auth;
        if (WebsocketJwtGuard.isHandshakeAuth(authObject) && authObject.token)
            return authObject.token;

        return null;
    }

    public static isHandshakeAuth(auth: unknown): auth is HandshakeAuth {
        return (
            typeof auth === "object" &&
            auth !== null &&
            "token" in auth &&
            typeof (auth as Record<string, unknown>).token === "string" &&
            (auth as Record<string, unknown>).token !== ""
        );
    }
}
