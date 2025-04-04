import { Injectable } from "@nestjs/common";
import { Prisma, Users as UserModel } from "@prisma/client";
import { PrismaService } from "@app/prisma/prisma.service";

import { UserUpdateDto } from "./dto/user.dto";

@Injectable()
export class UserService {
    public constructor(private prisma: PrismaService) {}

    public async saveUser(data: Prisma.UsersCreateInput): Promise<UserModel> {
        return this.prisma.users.create({ data });
    }

    public async findUserOneByEmail(email: string): Promise<UserModel | null> {
        return this.prisma.users.findUnique({ where: { email } });
    }

    public async findUserOneById(
        args: { id: string } | Prisma.UsersFindUniqueArgs,
    ): Promise<UserModel | null> {
        if ("id" in args) {
            return this.prisma.users.findUnique({ where: { id: args.id } });
        }

        return this.prisma.users.findUnique(args);
    }

    public async update(id: string, userData: UserUpdateDto): Promise<UserModel> {
        return this.prisma.users.update({ where: { id }, data: userData });
    }
}
