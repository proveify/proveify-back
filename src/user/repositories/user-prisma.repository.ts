import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Users as UserModel, Prisma } from "@prisma/client";

@Injectable()
export class UserPrismaRepository {
    public constructor(private prisma: PrismaService) { }

    public async createUser(data: Prisma.UsersCreateInput): Promise<UserModel> {
        return this.prisma.users.create({
            data,
            include: {
                Provider: true,
            },
        });
    }

    public async findUniqueUserByEmail(email: string): Promise<UserModel | null> {
        return this.prisma.users.findUnique({
            where: { email },
            include: {
                Provider: true,
            },
        });
    }

    public async findUniqueUserById(
        args: { id: string } | Prisma.UsersFindUniqueArgs,
    ): Promise<UserModel | null> {
        if ("id" in args) {
            return this.prisma.users.findUnique({
                where: { id: args.id },
                include: {
                    Provider: true,
                },
            });
        }
        return this.prisma.users.findUnique(args);
    }

    public async updateUser(id: string, data: Prisma.UsersUpdateInput): Promise<UserModel> {
        return this.prisma.users.update({
            where: { id },
            data,
            include: {
                Provider: true,
            },
        });
    }
}