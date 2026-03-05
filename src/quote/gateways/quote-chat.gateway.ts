import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayDisconnect,
    OnGatewayConnection,
} from "@nestjs/websockets";
import { TypedSocket } from "@app/auth/interfaces/ws-auth.interface";
import { QuoteMessageDto } from "@app/quote/dto/quote.dto";
import { Server } from "socket.io";
import { PrismaService } from "@app/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { WebsocketAuthMiddleware } from "@app/auth/middlewares/socket-auth.middleware";
import { WsValidationPipe } from "@app/common/helpers/ws-validation-pipe";

@WebSocketGateway({ namespace: "quotes" })
export class QuoteChatGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
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

                    socket.data.joinedRooms = [quoteId];
                    next();
                } catch {
                    const err = new Error("Could not validate quote id");
                    next(err);
                }
            })();
        });
    }

    public handleConnection(client: TypedSocket): void {
        const quoteId = client.handshake.query.id as string;
        const room = `quote_${quoteId}`;

        if (!client.data.joinedRooms.includes(room)) {
            client.data.joinedRooms.push(room);
        }
    }

    public handleDisconnect(client: TypedSocket): void {
        const quoteId = client.handshake.query.id as string;
        const room = `quote_${quoteId}`;

        client.data.joinedRooms = client.data.joinedRooms.filter((r: string) => r !== room);
    }

    @SubscribeMessage("quote-message")
    public async handleMessage(
        @MessageBody(WsValidationPipe) message: QuoteMessageDto,
        @ConnectedSocket() client: TypedSocket,
    ): Promise<void> {
        const user = client.data.user;
        const quoteId = client.handshake.query.id as string;

        await this.prismaService.$transaction(async (tx) => {
            const quoteMessage = await tx.quoteMessages.create({
                data: {
                    content: message.content,
                    quote_id: quoteId,
                    user_id: user.id,
                },
            });

            this.server.to(`quote_${quoteId}`).emit("new-message", {
                messageId: quoteMessage.id,
                userId: user.id,
                content: message.content,
                timestamp: quoteMessage.created_at.toISOString(),
                quoteId: quoteId,
            });
        });
    }

    @SubscribeMessage("join-quote")
    public async handleJoinQuote(
        @MessageBody() quoteId: string,
        @ConnectedSocket() client: TypedSocket,
    ): Promise<{ ok: true; room: string }> {
        await client.join(`quote_${quoteId}`);
        return { ok: true, room: `quote_${quoteId}` };
    }
}
