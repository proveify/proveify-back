import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UserPrismaRepository } from "./repositories/user-prisma.repository";
import { UserNotFoundException } from "./exceptions/user-not-found.exception/user-not-found.exception";
import { UserEntity } from "./entities/user.entity";
import { UserFactory } from "@app/user/factories/user.factory";

@Injectable()
export class UserService {
    public constructor(
        private readonly userPrismaRepository: UserPrismaRepository,
        private readonly userFactory: UserFactory,
    ) {}

    public async saveUser(data: Prisma.UsersCreateInput): Promise<UserEntity> {
        const user = await this.userPrismaRepository.createUser(data);
        return this.userFactory.create(user);
    }

    public async findUserOneByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.userPrismaRepository.findUniqueUserByEmail(email);

        if (!user) {
            return null;
        }

        return this.userFactory.create(user);
    }

    public async findUserOneById(
        args: { id: string } | Prisma.UsersFindUniqueArgs,
    ): Promise<UserEntity | null> {
        const user = await this.userPrismaRepository.findUniqueUserById(args);

        if (!user) {
            return null;
        }

        return this.userFactory.create(user);
    }

    public async update(id: string, userData: Prisma.UsersUpdateInput): Promise<UserEntity> {
        const user = await this.userPrismaRepository.updateUser(id, userData);
        return this.userFactory.create(user);
    }

    public async getUserProfile(id: string): Promise<UserEntity> {
        const user = await this.userPrismaRepository.findUniqueUserById({
            where: { id },
            include: { provider: true },
        });

        if (!user) {
            throw new UserNotFoundException(id);
        }

        return this.userFactory.create(user);
    }
}
