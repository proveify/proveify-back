import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Users as UserModel, Prisma } from "@prisma/client";
import { TransactionContextService } from "@app/prisma/transaction-context.service";
import { PrismaRepository } from "@app/prisma/interfaces/prisma-repository.interface";

@Injectable()
export class UserPrismaRepository implements PrismaRepository {
    public constructor(
        private readonly prisma: PrismaService,
        private readonly transactionContext: TransactionContextService,
    ) {}

    public getClient(): Prisma.TransactionClient {
        return this.transactionContext.getTransaction() ?? this.prisma;
    }

    public async createUser(data: Prisma.UsersCreateInput): Promise<UserModel> {
        const prisma = this.getClient();
        return prisma.users.create({
            data,
            include: {
                provider: true,
            },
        });
    }

    public async findUniqueUserByEmail(email: string): Promise<UserModel | null> {
        const prisma = this.getClient();
        return prisma.users.findUnique({
            where: { email },
            include: {
                provider: true,
            },
        });
    }

    public async findUniqueUserById(
        args: { id: string } | Prisma.UsersFindUniqueArgs,
    ): Promise<UserModel | null> {
        const prisma = this.getClient();
        if ("id" in args) {
            return prisma.users.findUnique({
                where: { id: args.id },
                include: {
                    provider: true,
                },
            });
        }
        return prisma.users.findUnique(args);
    }

    public async updateUser(id: string, data: Prisma.UsersUpdateInput): Promise<UserModel> {
        const prisma = this.getClient();
        return prisma.users.update({
            where: { id },
            data,
            include: {
                provider: true,
            },
        });
    }
}
