import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Files as FileModel, Prisma } from "@prisma/client";

@Injectable()
export class FilePrismaRepository {
    public constructor(private prisma: PrismaService) {}

    public async createFile(data: Prisma.FilesCreateInput): Promise<FileModel> {
        return this.prisma.files.create({
            data,
            include: {
                user: true,
            },
        });
    }

    public async findUniqueFile(id: string): Promise<FileModel | null> {
        return this.prisma.files.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
    }

    public async updateFile(id: string, data: Prisma.FilesUpdateInput): Promise<FileModel> {
        return this.prisma.files.update({
            where: { id },
            data,
            include: {
                user: true,
            },
        });
    }
}
