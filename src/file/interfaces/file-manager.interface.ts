import type { MemoryStoredFile } from "nestjs-form-data";

export interface AzureFileConfigs {
    containerClientName: string;
}

export interface FileManagerInterface {
    upload(
        file: MemoryStoredFile,
        route: string | null,
        configs: AzureFileConfigs | null,
    ): Promise<string> | string;
}

export enum ResourceType {
    RUT = "rut",
    CHAMBER_COMMERCE = "chamber_commerce",
}
