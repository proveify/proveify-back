import { Injectable } from "@nestjs/common";
import { Users as UserModel, Prisma } from "@prisma/client";
import { PrismaService } from "@app/prisma/prisma.service";

import { UpdateAllDto } from "./dto/user.dto";

@Injectable()
export class UserService {
    public static CLIENT_TYPE_KEY = "CLIENT";
    public static PROVIDER_TYPE_KEY = "PROVIDER";

    public constructor(private prisma: PrismaService) {}

    public async saveUser(data: Prisma.UsersCreateInput): Promise<UserModel> {
        return this.prisma.users.create({ data });
    }

    public async findUserOneByEmail(email: string): Promise<UserModel | null> {
        return this.prisma.users.findUnique({ where: { email } });
    }

    public async findUserOneById(id: string): Promise<UserModel | null> {
        return this.prisma.users.findUnique({ where: { id } });
    }

    public async update(id: string, userData: UpdateAllDto): Promise<UserModel> {
        const user = await this.prisma.users.update({ where: { id }, data: userData });

        return user;
    }
}
