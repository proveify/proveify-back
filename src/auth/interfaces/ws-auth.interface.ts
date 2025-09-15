import type { TokenPayload } from "@app/auth/interfaces/auth.interface";
import type { Socket } from "socket.io";

export interface ClientToServerEvents {
    "quote-message": (data: { quoteId: string }) => void;
    "join-quote-room": (data: { quoteId: string }) => void;
    "leave-quote-room": (data: { quoteId: string }) => void;
}

export interface ServerToClientEvents {
    "new-message": (data: {
        messageId: string;
        userId: string;
        content: string;
        timestamp: string;
        quoteId: string;
    }) => void;
    "user-joined": (data: { userId: string; quoteId: string }) => void;
    "user-left": (data: { userId: string; quoteId: string }) => void;
    error: (message: string) => void;
}

export interface InterServeEvents {
    ping: () => void;
}

export interface SocketData {
    user: TokenPayload;
    joinedRooms: string[];
}

export type TypedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServeEvents,
    SocketData
>;

export interface HandshakeAuth {
    token?: string;
}
