import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PrismaModule } from "@app/prisma/prisma.module";
import { UserStoreService } from "@app/user/user-store.service";

@Module({
    controllers: [UserController],
    providers: [UserService, UserStoreService],
    imports: [PrismaModule, UserModule],
    exports: [UserService, UserStoreService],
})
export class UserModule {}
