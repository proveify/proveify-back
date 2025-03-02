import { Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { MulterModule } from "@nestjs/platform-express";
import { MulterConfigProvider } from "./config/multer.config";
import { AzureBlobStorageRepository } from "@app/file/repositories/azure/azure-blob-storage.repository";
import { UserModule } from "@app/user/user.module";
import { PrismaModule } from "@app/prisma/prisma.module";

@Module({
    providers: [FileService, AzureBlobStorageRepository],
    imports: [
        MulterModule.registerAsync({
            useClass: MulterConfigProvider,
        }),
        UserModule,
        PrismaModule,
    ],
    exports: [FileService],
})
export class FileModule {}
