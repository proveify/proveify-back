import { Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { MulterModule } from "@nestjs/platform-express";
import { MulterCofigService } from "./config/multer.config";

@Module({
    providers: [FileService],
    imports: [
        MulterModule.registerAsync({
            useClass: MulterCofigService,
        }),
    ],
    exports: [FileService],
})
export class FileModule {}
