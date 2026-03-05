import { IoAdapter } from "@nestjs/platform-socket.io";
import type { INestApplicationContext } from "@nestjs/common";
import type { ServerOptions } from "socket.io";

export class SocketIoAdapter extends IoAdapter {
    private readonly options: Partial<ServerOptions>;

    public constructor(app: INestApplicationContext, options: Partial<ServerOptions>) {
        super(app);
        this.options = options;
    }

    public override createIOServer(port: number, options?: ServerOptions): unknown {
        return super.createIOServer(port, {
            ...(options ?? {}),
            ...this.options,
        });
    }
}
