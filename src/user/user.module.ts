import { forwardRef, Global, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserPrismaRepository } from "./repositories/user-prisma.repository";
import { UserFactory } from "@app/user/factories/user.factory";
import { ProviderModule } from "@app/provider/provider.module";
import { UserProviderMapper } from "./mappers/user-provider.mapper";

@Module({
    controllers: [UserController],
    providers: [UserService, UserPrismaRepository, UserFactory, UserProviderMapper],
    exports: [UserService, UserPrismaRepository, UserFactory, UserProviderMapper],
    imports: [forwardRef(() => ProviderModule)],
})
@Global()
export class UserModule {}
