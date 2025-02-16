import { Injectable } from "@nestjs/common";
import { Users as UserModel, Prisma } from "@prisma/client";
import { PrismaService } from "@app/prisma/prisma.service";
import { UserType } from "./configs/interfaces/interfaces";

import * as UserTypes from "./configs/parameters/users_types.json";

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

    public static getUserTypeIdByKey(key: string): number | undefined {
        const types = UserTypes as UserType[];
        return types.find((type: UserType) => type.key === key)?.id;
    }
}
