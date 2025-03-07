import type { MemoryStoredFile } from "nestjs-form-data";

export interface AzureFileConfigs {
    containerClientName: string;
}

export interface GoogleFileConfigs {
    bucketName: string;
}

export interface FileManagerInterface<T> {
    upload(file: MemoryStoredFile, route: string | null, configs: T): Promise<string> | string;
}

export enum ResourceType {
    RUT = "rut",
    CHAMBER_COMMERCE = "chamber_commerce",
}
