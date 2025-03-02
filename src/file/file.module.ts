import { Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { MulterModule } from "@nestjs/platform-express";
import { MulterConfigProvider } from "./config/multer.config";
import { AzureBlobStorageRepository } from "@app/file/repositories/azure/azure-blob-storage.repository";

@Module({
    providers: [FileService, AzureBlobStorageRepository],
    imports: [
        MulterModule.registerAsync({
            useClass: MulterConfigProvider,
        }),
    ],
    exports: [FileService],
})
export class FileModule {}
