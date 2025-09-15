import type { JwtService } from "@nestjs/jwt";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import type { TokenPayload } from "@app/auth/interfaces/auth.interface";
import type { HandshakeAuth, TypedSocket } from "@app/auth/interfaces/ws-auth.interface";

@Injectable()
export class WebsocketJwtGuard implements CanActivate {
    public constructor(private readonly jwtService: JwtService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient<TypedSocket>();
            const token = WebsocketJwtGuard.extractTokenFromHandShake(client);
            if (!token) return false;

            client.data.user = await this.jwtService.verifyAsync<TokenPayload>(token);
            client.data.joinedRooms = [];

            return true;
        } catch {
            throw new WsException("Invalid token");
        }
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
