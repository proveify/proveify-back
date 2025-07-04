import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Items as ItemModel, Prisma } from "@prisma/client";

@Injectable()
export class ItemPrismaRepository {
    public constructor(private prisma: PrismaService) { }

    public async create(args: Prisma.ItemsCreateArgs): Promise<ItemModel> {
        return this.prisma.items.create(args);
    }

    public async findMany(args?: Prisma.ItemsFindManyArgs): Promise<ItemModel[]> {
        return this.prisma.items.findMany(args);
    }

    public async findUnique(args: Prisma.ItemsFindUniqueArgs): Promise<ItemModel | null> {
        return this.prisma.items.findUnique(args);
    }

    public async update(args: Prisma.ItemsUpdateArgs): Promise<ItemModel> {
        return this.prisma.items.update(args);
    }

    public async delete(args: Prisma.ItemsDeleteArgs): Promise<ItemModel> {
        return this.prisma.items.delete(args);
    }
}