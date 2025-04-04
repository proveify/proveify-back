import { Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { MulterModule } from "@nestjs/platform-express";
import { MulterConfigProvider } from "./config/multer.config";
import { UserModule } from "@app/user/user.module";
import { PrismaModule } from "@app/prisma/prisma.module";
import { CloudStorageRepository } from "@app/file/repositories/gcp/cloud-storage.repository";

@Module({
    providers: [FileService, CloudStorageRepository],
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
