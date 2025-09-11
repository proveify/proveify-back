import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Files as FileModel, Prisma } from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class FilePrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createFile(data: Prisma.FilesCreateInput): Promise<FileModel> {
        const prisma = this.getClient();
        return prisma.files.create({
            data,
            include: {
                user: true,
            },
        });
    }

    public async findUniqueFile(id: string): Promise<FileModel | null> {
        const prisma = this.getClient();
        return prisma.files.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
    }

    public async updateFile(id: string, data: Prisma.FilesUpdateInput): Promise<FileModel> {
        const prisma = this.getClient();
        return prisma.files.update({
            where: { id },
            data,
            include: {
                user: true,
            },
        });
    }
}
