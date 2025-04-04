import { Injectable, Optional } from "@nestjs/common";
import {
    FileManagerInterface,
    GoogleFileConfigs,
} from "@app/file/interfaces/file-manager.interface";
import { Storage } from "@google-cloud/storage";
import { MemoryStoredFile } from "nestjs-form-data";
import { ConfigService } from "@nestjs/config";
import { appConfig } from "@app/configs/base.config";

@Injectable()
export class CloudStorageRepository implements FileManagerInterface<GoogleFileConfigs> {
    private client: Storage;

    public constructor(
        private configService: ConfigService<typeof appConfig, true>,
        @Optional() keyFilename?: string,
    ) {
        if (!keyFilename) {
            keyFilename = configService.get<string>("app.keyFilename", { infer: true });
        }

        this.client = new Storage({ keyFilename });
    }

    public async upload(
        file: MemoryStoredFile,
        route: string,
        configs?: GoogleFileConfigs,
    ): Promise<string> {
        const client = this.client;
        const bucket = client.bucket(
            configs?.bucketName ?? this.configService.get<string>("app.bucket", { infer: true }),
        );
        const path = `${route}/${file.originalName}`;
        const bucketFile = bucket.file(path);
        await bucketFile.save(file.buffer);

        return path;
    }

    public async update(
        file: MemoryStoredFile,
        path: string,
        configs?: GoogleFileConfigs,
    ): Promise<boolean> {
        const client = this.client;
        const bucket = client.bucket(
            configs?.bucketName ?? this.configService.get<string>("app.bucket", { infer: true }),
        );

        try {
            const object = bucket.file(path);
            await object.save(file.buffer);
        } catch {
            return false;
        }

        return true;
    }
}
