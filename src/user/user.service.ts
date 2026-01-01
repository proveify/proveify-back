import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UserPrismaRepository } from "./repositories/user-prisma.repository";
import { UserNotFoundException } from "./exceptions/user-not-found.exception/user-not-found.exception";
import { UserEntity } from "./entities/user.entity";
import { UserFactory } from "@app/user/factories/user.factory";
import { ClsService } from "nestjs-cls";
import { UserUpdateDto, UserUpdateProfilePicture } from "@app/user/dto/user.dto";
import { FileService } from "@app/file/file.service";
import { ResourceType } from "@app/file/interfaces/file-manager.interface";

@Injectable()
export class UserService {
    public constructor(
        private readonly userPrismaRepository: UserPrismaRepository,
        private readonly userFactory: UserFactory,
        private readonly cls: ClsService,
        private readonly fileService: FileService,
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

    public async updateWithProviderData(data: UserUpdateDto): Promise<UserEntity> {
        const user = this.cls.get<UserEntity>("user");

        const userData: Prisma.UsersUpdateInput = {
            name: data.name,
            identification: data.identification,
            identification_type: data.identification_type,
            phone: data.phone,
            email: data.email,
            provider: {
                update: {
                    data: data.provider,
                },
            },
        };

        return await this.update(user.id, userData);
    }

    public async getUserProfile(id: string, fromCls = false): Promise<UserEntity> {
        if (fromCls) {
            return this.cls.get<UserEntity>("user");
        }

        const user = await this.userPrismaRepository.findUniqueUserById({
            where: { id },
            include: { provider: true },
        });

        if (!user) {
            throw new UserNotFoundException(id);
        }

        return this.userFactory.create(user);
    }

    public async upProfilePicture(data: UserUpdateProfilePicture): Promise<UserEntity> {
        const user = this.cls.get<UserEntity>("user");
        let file = user.profile_picture_id
            ? await this.fileService.getFileById(user.profile_picture_id)
            : null;

        if (!file) {
            file = await this.fileService.save(data.image, ResourceType.PROFILE_PICTURE);
            user.profile_picture_id = file.id;
            user.profile_picture_url = await this.fileService.getFileUrlById(file.id);

            await this.userPrismaRepository.updateUser(user.id, { profile_picture_id: file.id });

            return user;
        }

        await this.fileService.update(file, data.image);
        return user;
    }
}
