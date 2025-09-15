import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { TypedSocket } from "@app/auth/interfaces/ws-auth.interface";
import { JwtService } from "@nestjs/jwt";
import { WebsocketJwtGuard } from "@app/auth/guards/websocket-jwt.guard";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import { QuoteMessageDto } from "@app/quote/dto/quote.dto";
import { UseGuards } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";

@WebSocketGateway({ cors: true, transports: ["websocket"] })
export class QuoteChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    public server: TypedSocket;

    public constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    public async handleConnection(client: TypedSocket): Promise<void> {
        try {
            const token = WebsocketJwtGuard.extractTokenFromHandShake(client);

            if (!token) {
                client.disconnect(true);
                return;
            }

            client.data.user = await this.jwtService.verifyAsync<TokenPayload>(token);
            client.data.joinedRooms = [];
        } catch {
            client.disconnect(true);
        }
    }

    public handleDisconnect(client: TypedSocket): void {
        const userId = client.data.user.id;

        for (const room of client.data.joinedRooms) {
            client.broadcast.to(room).emit("user-left", {
                userId: userId,
                quoteId: room,
            });
        }
    }

    @UseGuards(WebsocketJwtGuard)
    @SubscribeMessage("quote-message")
    public async handleMessage(
        @MessageBody() message: QuoteMessageDto,
        @ConnectedSocket() client: TypedSocket,
    ): Promise<void> {
        const user = client.data.user;

        await this.prismaService.$transaction(async (tx) => {
            const quoteMessage = await tx.quoteMessages.create({
                data: {
                    content: message.content,
                    quote_id: message.quoteId,
                    user_id: user.id,
                },
            });

            this.server.to(`quote_${message.quoteId}`).emit("new-message", {
                messageId: "temp-id",
                userId: user.id,
                content: message.content,
                timestamp: quoteMessage.created_at.toISOString(),
                quoteId: message.quoteId,
            });
        });
    }

    @UseGuards(WebsocketJwtGuard)
    @SubscribeMessage("join-quote-room")
    public async handleJoinRoom(
        @MessageBody() data: { quoteId: string },
        @ConnectedSocket() client: TypedSocket,
    ): Promise<void> {
        const room = `quote_${data.quoteId}`;
        await client.join(room);

        if (!client.data.joinedRooms.includes(room)) {
            client.data.joinedRooms.push(room);
        }
    }

    @UseGuards(WebsocketJwtGuard)
    @SubscribeMessage("leave-quote-room")
    public async handleLeaveRoom(
        @MessageBody() data: { quoteId: string },
        @ConnectedSocket() client: TypedSocket,
    ): Promise<void> {
        const room = `quote_${data.quoteId}`;
        await client.leave(room);
        client.data.joinedRooms = client.data.joinedRooms.filter((r) => r !== room);
    }
}
