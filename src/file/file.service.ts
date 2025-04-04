import { Injectable } from "@nestjs/common";
import { MemoryStoredFile } from "nestjs-form-data";
import { v4 as uuidv4 } from "uuid";

import { UserStoreService } from "@app/user/user-store.service";
import { Prisma, Files as FileModel } from "@prisma/client";
import { CreateFileDto } from "@app/file/dto/file.dto";
import { PrismaService } from "@app/prisma/prisma.service";
import { CloudStorageRepository } from "@app/file/repositories/gcp/cloud-storage.repository";

@Injectable()
export class FileService {
    public constructor(
        private cloudStorageRepository: CloudStorageRepository,
        private userStoreService: UserStoreService,
        private prisma: PrismaService,
    ) {}

    public async save(
        file: MemoryStoredFile,
        resourceType: string,
        route: string | null = null,
    ): Promise<FileModel> {
        const user = this.userStoreService.getUsers();

        if (!user) {
            throw new Error("User not found");
        }

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
        path: string,
    ): Promise<{ path: string; hasUpdated: boolean }> {
        const hasUpdated = await this.cloudStorageRepository.update(memoryFile, path);

        if (hasUpdated) {
            const data: Prisma.FilesUpdateInput = {
                original_name: memoryFile.originalName,
            };

            await this.updateFile(file.id, data);
        }

        return {
            path,
            hasUpdated,
        };
    }

    private async updateFile(id: string, data: Prisma.FilesUpdateInput): Promise<FileModel> {
        return this.prisma.files.update({ where: { id }, data });
    }

    public async getFileById(id: string): Promise<FileModel | null> {
        return this.prisma.files.findUnique({ where: { id } });
    }
}
