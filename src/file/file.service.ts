import { Injectable } from "@nestjs/common";
import { MemoryStoredFile } from "nestjs-form-data";
import { v4 as uuidv4 } from "uuid";

import { Prisma, Files as FileModel } from "@prisma/client";
import { CreateFileDto } from "@app/file/dto/file.dto";
import { PrismaService } from "@app/prisma/prisma.service";
import { CloudStorageRepository } from "@app/file/repositories/gcp/cloud-storage.repository";
import { AuthContextService } from "@app/auth/auth-context.service";
import { ResourceType } from "./interfaces/file-manager.interface";

@Injectable()
export class FileService {
    public constructor(
        private cloudStorageRepository: CloudStorageRepository,
        private authContextService: AuthContextService,
        private prisma: PrismaService,
    ) {}

    public async save(
        file: MemoryStoredFile,
        resourceType: ResourceType,
        route: string | null = null,
    ): Promise<FileModel> {
        const user = this.authContextService.getUser();
        const name = this.generateUniqueFIleName(file.extension);
        const originalName = file.originalName;
        file.originalName = name;

        const path = await this.cloudStorageRepository.upload(file, route);
        const fileDto: CreateFileDto = {
            path,
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

    private generateUniqueFIleName(extension: string): string {
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
}
