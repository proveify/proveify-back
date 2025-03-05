import { Injectable } from "@nestjs/common";
import { Prisma, Users as UserModel } from "@prisma/client";
import { PrismaService } from "@app/prisma/prisma.service";
import { UserStoreService } from "@app/user/user-store.service";

import { UserUpdateDto } from "./dto/user.dto";

@Injectable()
export class UserService {
    public constructor(
        private prisma: PrismaService,
        private userStoreService: UserStoreService,
    ) {}

    public async saveUser(data: Prisma.UsersCreateInput): Promise<UserModel> {
        return this.prisma.users.create({ data });
    }

    public async findUserOneByEmail(email: string): Promise<UserModel | null> {
        return this.prisma.users.findUnique({ where: { email } });
    }

    public async findUserOneById(id: string): Promise<UserModel | null> {
        return this.prisma.users.findUnique({ where: { id } });
    }

    public async update(id: string, userData: UserUpdateDto): Promise<UserModel> {
        return this.prisma.users.update({ where: { id }, data: userData });
    }
}
