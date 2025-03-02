import { Injectable, Optional } from "@nestjs/common";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

import { AzureFileConfigs, FileManager } from "@app/file/interfaces/file-manager";
import { MemoryStoredFile } from "nestjs-form-data";

@Injectable()
export class AzureBlobStorageRepository implements FileManager {
    private client: BlobServiceClient;

    public constructor(
        @Optional() credentials: StorageSharedKeyCredential | null,
        @Optional() storageAccountBaseUrl: string | null,
    ) {
        if (!credentials) {
            if (!process.env.AZ_ACCOUNT_NAME || !process.env.AZ_ACCOUNT_KEY) {
                throw new Error("Azure account name and key are required");
            }

            credentials = new StorageSharedKeyCredential(
                process.env.AZ_ACCOUNT_NAME,
                process.env.AZ_ACCOUNT_KEY,
            );
        }

        if (!storageAccountBaseUrl) {
            if (!process.env.AZ_ACCOUNT_BASE_URL) {
                throw new Error("Azure account base url is required");
            }

            storageAccountBaseUrl = process.env.AZ_ACCOUNT_BASE_URL;
        }

        this.client = new BlobServiceClient(storageAccountBaseUrl, credentials);
    }

    public async upload(
        file: MemoryStoredFile,
        route: string | null = null,
        configs: AzureFileConfigs | null = null,
    ): Promise<string> {
        const containerClientName = configs?.containerClientName ?? "proveify";
        const containerClient = this.client.getContainerClient(containerClientName);
        const path = route ? `${route}/${file.originalName}` : file.originalName;
        const blockBlobClient = containerClient.getBlockBlobClient(path);

        await blockBlobClient.uploadData(file.buffer, {
            blockSize: file.size,
            blobHTTPHeaders: {
                blobContentType: file.mimetype,
                blobContentEncoding: file.encoding,
            },
        });

        return path;
    }
}
