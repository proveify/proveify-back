import { Injectable } from "@nestjs/common";
import { Prisma, Users as UserModel } from "@prisma/client";
import { UserPrismaRepository } from "./repositories/user-prisma.repository";
import { UserUpdateDto } from "./dto/user.dto";
import { UserNotFoundException } from "./exceptions/user-not-found.exception/user-not-found.exception";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UserService {
    public constructor(private userPrismaRepository: UserPrismaRepository) {}

    public async saveUser(data: Prisma.UsersCreateInput): Promise<UserModel> {
        return this.userPrismaRepository.createUser(data);
    }

    public async findUserOneByEmail(email: string): Promise<UserModel | null> {
        return this.userPrismaRepository.findUniqueUserByEmail(email);
    }

    public async findUserOneById(
        args: { id: string } | Prisma.UsersFindUniqueArgs,
    ): Promise<UserModel | null> {
        return this.userPrismaRepository.findUniqueUserById(args);
    }

    public async update(id: string, userData: UserUpdateDto): Promise<UserModel> {
        return this.userPrismaRepository.updateUser(id, userData);
    }

    public async getUserProfile(id: string): Promise<UserEntity> {
        const user = await this.userPrismaRepository.findUniqueUserById({
            where: { id },
            include: { Provider: true },
        });

        if (!user) {
            throw new UserNotFoundException(id);
        }

        // Retorna una instancia de UserEntity
        return new UserEntity(user);
    }
}
