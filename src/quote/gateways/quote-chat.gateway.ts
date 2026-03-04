import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayDisconnect,
} from "@nestjs/websockets";
import { TypedSocket } from "@app/auth/interfaces/ws-auth.interface";
import { QuoteMessageDto } from "@app/quote/dto/quote.dto";
import { Server } from "socket.io";
import { PrismaService } from "@app/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { WebsocketAuthMiddleware } from "@app/auth/middlewares/socket-auth.middleware";
import { WsValidationPipe } from "@app/common/helpers/ws-validation-pipe";

@WebSocketGateway({ namespace: "quotes" })
export class QuoteChatGateway implements OnGatewayInit, OnGatewayDisconnect {
    @WebSocketServer()
    public server: Server;

    public constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    public afterInit(client: Server): void {
        client.use(WebsocketAuthMiddleware(this.jwtService));

        client.use((socket: TypedSocket, next) => {
            void (async (): Promise<void> => {
                try {
                    const quoteId = socket.handshake.query.id;

                    if (!quoteId || typeof quoteId !== "string") {
                        const err = new Error("Missing quote id");
                        next(err);
                        return;
                    }

                    const quote = await this.prismaService.quotes.findUnique({
                        where: { id: quoteId },
                        select: { id: true },
                    });

                    if (!quote) {
                        const err = new Error("Quote not found");
                        next(err);
                        return;
                    }

                    next();
                } catch {
                    const err = new Error("Could not validate quote id");
                    next(err);
                }
            })();
        });
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

    @SubscribeMessage("quote-message")
    public async handleMessage(
        @MessageBody(WsValidationPipe) message: QuoteMessageDto,
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
                messageId: quoteMessage.id,
                userId: user.id,
                content: message.content,
                timestamp: quoteMessage.created_at.toISOString(),
                quoteId: message.quoteId,
            });
        });
    }

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

    @SubscribeMessage("leave-quote-room")
    public async handleLeaveRoom(
        @MessageBody() data: { quoteId: string },
        @ConnectedSocket() client: TypedSocket,
    ): Promise<void> {
        const room = `quote_${data.quoteId}`;
        await client.leave(room);
        client.data.joinedRooms = client.data.joinedRooms.filter((r: string) => r !== room);
    }
}
