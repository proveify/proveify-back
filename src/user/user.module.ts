import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserPrismaRepository } from "./repositories/user-prisma.repository";
@Module({
    controllers: [UserController],
    providers: [UserService, UserPrismaRepository],
    imports: [UserModule],
    exports: [UserService, UserPrismaRepository],
})
export class UserModule {}
