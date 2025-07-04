import { Global, Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { MulterModule } from "@nestjs/platform-express";
import { MulterConfigProvider } from "./config/multer.config";
import { UserModule } from "@app/user/user.module";
import { CloudStorageRepository } from "@app/file/repositories/gcp/cloud-storage.repository";
import { FilePrismaRepository } from "./repositories/file-prisma.repository";

@Global()
@Module({
    providers: [FileService, CloudStorageRepository, FilePrismaRepository],
    imports: [
        MulterModule.registerAsync({
            useClass: MulterConfigProvider,
        }),
        UserModule,
    ],
    exports: [FileService, FilePrismaRepository],
})
export class FileModule {}
