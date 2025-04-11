import type { MemoryStoredFile } from "nestjs-form-data";

export interface GoogleFileConfigs {
    bucketName: string;
}

export interface FileManagerInterface<T> {
    upload(file: MemoryStoredFile, route: string | null, configs: T): Promise<string> | string;
}

export enum ResourceType {
    RUT = "rut",
    CHAMBER_COMMERCE = "chamber_commerce",
    ITEM_IMAGE = "item_image",
}

// Si se agrega un nuevo tipo de recurso, se debe agregar el path correspondiente en el enum ResourceTypePath

export enum ResourceTypePath {
    "rut" = "providers/rut",
    "chamber_commerce" = "providers/chamber_commerce",
    "item_image" = "providers/item_image",
}
