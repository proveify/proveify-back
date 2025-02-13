import { Injectable } from "@nestjs/common";
import { Users as UserModel, Prisma } from "@prisma/client";
import { PrismaService } from "@app/prisma/prisma.service";
import { UserType } from "./configs/interfaces/interfaces";
import { randomBytes, pbkdf2Sync } from "crypto";

import * as UserTypes from "./configs/parameters/users_types.json";

@Injectable()
export class UserService {
    private static SALT_SIZE = 16;

    public static CLIENT_TYPE_KEY = "CLIENT";
    public static PROVIDER_TYPE_KEY = "PROVIDER";

    public constructor(private prisma: PrismaService) {}

    public async createUser(data: Prisma.UsersCreateInput): Promise<UserModel> {
        data.password = this.generatePasswordHash(data.password);
        return this.prisma.users.create({ data });
    }

    public validatePassword(password: string, hash: string): boolean {
        const passwordHashed = this.generatePasswordHash(password);
        return passwordHashed === hash;
    }

    private generatePasswordHash(password: string): string {
        const salt = randomBytes(UserService.SALT_SIZE).toString("hex");
        return pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    }

    public static getUserTypeIdByKey(key: string): number | undefined {
        const types = UserTypes as UserType[];
        return types.find((type: UserType) => type.key === key)?.id;
    }
}
