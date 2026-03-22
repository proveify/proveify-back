import { forwardRef, Module } from "@nestjs/common";
import { ProviderService } from "./provider.service";
import { ProviderController } from "./provider.controller";
import { ProviderPrismaRepository } from "./repositories/provider-prisma.repository";
import { ProviderFactory } from "@app/provider/factories/provider.factory";
import { UserModule } from "@app/user/user.module";

@Module({
    imports: [forwardRef(() => UserModule)],
    providers: [ProviderService, ProviderPrismaRepository, ProviderFactory],
    exports: [ProviderService, ProviderPrismaRepository, ProviderFactory],
    controllers: [ProviderController],
})
export class ProviderModule {}
