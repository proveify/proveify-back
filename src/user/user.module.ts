import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserPrismaRepository } from "./repositories/user-prisma.repository";
import { UserFactory } from "@app/user/factories/user.factory";
import { ProviderModule } from "@app/provider/provider.module";
@Module({
    controllers: [UserController],
    providers: [UserService, UserPrismaRepository, UserFactory],
    exports: [UserService, UserPrismaRepository, UserFactory],
    imports: [ProviderModule],
})
export class UserModule {}
