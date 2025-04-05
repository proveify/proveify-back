import { Injectable } from "@nestjs/common";
import { MemoryStoredFile } from "nestjs-form-data";
import { v4 as uuidv4 } from "uuid";

import { Prisma, Files as FileModel } from "@prisma/client";
import { CreateFileDto } from "@app/file/dto/file.dto";
import { PrismaService } from "@app/prisma/prisma.service";
import { CloudStorageRepository } from "@app/file/repositories/gcp/cloud-storage.repository";
import { AuthContextService } from "@app/auth/auth-context.service";
import { ResourceType, ResourceTypePath } from "./interfaces/file-manager.interface";
import { ConfigService } from "@nestjs/config";
import { enviromentsConfig } from "@app/configs/base.config";

@Injectable()
export class FileService {
    public constructor(
        private cloudStorageRepository: CloudStorageRepository,
        private authContextService: AuthContextService,
        private prisma: PrismaService,
        private configService: ConfigService<typeof enviromentsConfig, true>,
    ) {}

    public async save(
        file: MemoryStoredFile,
        resourceType: ResourceType,
        route?: string,
    ): Promise<FileModel> {
        const enviroment = this.configService.get<string>("enviroments.enviroment", {
            infer: true,
        });

        const user = this.authContextService.getUser();
        const name = this.generateUniqueFileName(file.extension);
        const originalName = file.originalName;
        file.originalName = name;

        route = route ? `${enviroment}/${route}` : this.getAbsolutePathByResourceType(resourceType);
        const path = await this.cloudStorageRepository.upload(file, route);
        const fileDto: CreateFileDto = {
            path: path,
            name,
            original_name: originalName,
            resource_type: resourceType,
            user: {
                connect: {
                    id: user.id,
                },
            },
        };

        return this.saveFile(fileDto);
    }

    private async saveFile(data: Prisma.FilesCreateInput): Promise<FileModel> {
        return this.prisma.files.create({ data });
    }

    private generateUniqueFileName(extension: string): string {
        const uniqueId = uuidv4();
        const timestamp = Date.now().toString();

        return `${uniqueId}_${timestamp}.${extension}`;
    }

    public async update(
        file: FileModel,
        memoryFile: MemoryStoredFile,
        path?: string,
    ): Promise<{ updated: boolean; file: FileModel }> {
        const hasUpdated = await this.cloudStorageRepository.update(memoryFile, path ?? file.path);

        if (hasUpdated) {
            const data: Prisma.FilesUpdateInput = {
                original_name: memoryFile.originalName,
                path: path ?? file.path,
            };

            file = await this.updateFile(file.id, data);
            return { updated: true, file };
        }

        return { updated: false, file };
    }

    private async updateFile(id: string, data: Prisma.FilesUpdateInput): Promise<FileModel> {
        return this.prisma.files.update({ where: { id }, data });
    }

    public async getFileById(id: string): Promise<FileModel | null> {
        return this.prisma.files.findUnique({ where: { id } });
    }

    public getAbsolutePathByResourceType(resourceType: ResourceType): string {
        const enviroment = this.configService.get<string>("enviroments.enviroment", {
            infer: true,
        });
        return `${enviroment}/${ResourceTypePath[resourceType]}`;
    }

    public async getFileUrlById(id: string): Promise<string | null> {
        const file = await this.getFileById(id);

        if (!file) {
            return null;
        }

        return this.cloudStorageRepository.generateReadSignedUrl(file.path);
    }

    public async getFileUrlByPath(path: string): Promise<string> {
        return this.cloudStorageRepository.generateReadSignedUrl(path);
    }
}
