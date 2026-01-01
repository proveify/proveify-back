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
    PROFILE_PICTURE = "profile_picture",
    QUOTES = "quotes",
}

export const ResourceTypePath: Record<ResourceType, string> = {
    [ResourceType.RUT]: "providers/rut",
    [ResourceType.CHAMBER_COMMERCE]: "providers/chamber_commerce",
    [ResourceType.ITEM_IMAGE]: "providers/item_image",
    [ResourceType.PROFILE_PICTURE]: "users/profile_picture",
    [ResourceType.QUOTES]: "provider/quotes",
};
