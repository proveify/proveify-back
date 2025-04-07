import { Injectable } from "@nestjs/common";
import { Prisma, Users as UserModel } from "@prisma/client";
import { PrismaService } from "@app/prisma/prisma.service";
import { UserUpdateDto } from "./dto/user.dto";
import { UserResponse } from "./interfaces/user-response/user-response.interface";
import { UserMapper } from "./mappers/user-mapper/user-mapper";
import { UserNotFoundException } from "./exceptions/user-not-found.exception/user-not-found.exception";
import { UserStoreService } from "@app/user/user-store.service";

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

    public async getUserProfile(id: string): Promise<UserResponse> {
        const user = await this.findUserOneById(id);

        if (!user) {
            throw new UserNotFoundException(id);
        }

        return UserMapper.toUserResponse(user);
    }
}
