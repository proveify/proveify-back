import { Global, Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { MulterModule } from "@nestjs/platform-express";
import { MulterConfigProvider } from "./config/multer.config";
import { UserModule } from "@app/user/user.module";
import { CloudStorageRepository } from "@app/file/repositories/gcp/cloud-storage.repository";

@Global()
@Module({
    providers: [FileService, CloudStorageRepository],
    imports: [
        MulterModule.registerAsync({
            useClass: MulterConfigProvider,
        }),
        UserModule,
    ],
    exports: [FileService],
})
export class FileModule {}
