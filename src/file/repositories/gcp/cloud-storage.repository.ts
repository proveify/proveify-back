import { Injectable, Optional } from "@nestjs/common";
import {
    FileManagerInterface,
    GoogleFileConfigs,
} from "@app/file/interfaces/file-manager.interface";
import { Storage } from "@google-cloud/storage";
import { MemoryStoredFile } from "nestjs-form-data";
import { APP_IS_DEVELOPMENT } from "@root/configs/envs.config";

@Injectable()
export class CloudStorageRepository implements FileManagerInterface<GoogleFileConfigs> {
    private client: Storage;

    public constructor(@Optional() keyFilename?: string) {
        if (!keyFilename) {
            if (!process.env.KEY_FILENAME && !APP_IS_DEVELOPMENT) {
                throw new Error("Key file name is required");
            }

            keyFilename = process.env.KEY_FILENAME ?? "";
        }

        this.client = new Storage({ keyFilename });
    }

    public async upload(
        file: MemoryStoredFile,
        route: string | null = null,
        configs: GoogleFileConfigs | null = null,
    ): Promise<string> {
        const client = this.client;
        const bucket = client.bucket(configs?.bucketName ?? "proveify-bucket");
        const path = route ? `${route}/${file.originalName}` : file.originalName;

        const bucketFile = bucket.file(path);
        await bucketFile.save(file.buffer);

        return path;
    }
}
