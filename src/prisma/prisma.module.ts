import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { TransactionInterceptor } from "@app/prisma/interceptors/transaction.interceptor";

@Global()
@Module({
    providers: [PrismaService, TransactionContextService, TransactionInterceptor],
    exports: [PrismaService, TransactionContextService, TransactionInterceptor],
})
export class PrismaModule {}
