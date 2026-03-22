import { Injectable } from "@nestjs/common";
import { UserEntity } from "@app/user/entities/user.entity";
import { Prisma, Users as UserModel } from "@prisma/client";
import { FileService } from "@app/file/file.service";

export type UserInput = Prisma.UsersGetPayload<{ include: { provider?: true } }> | UserModel;

@Injectable()
export class UserFactory {
    public constructor(private readonly fileService: FileService) {}

    public async create(user: UserInput): Promise<UserEntity> {
        const entity = new UserEntity({
            id: user.id,
            email: user.email,
            name: user.name,
            user_type: user.user_type,
            identification: user.identification,
            identification_type: user.identification_type,
            created_at: user.created_at,
            phone: user.phone,
            updated_at: user.updated_at,
            password: user.password,
            refreshed_token: user.refreshed_token,
            profile_picture_id: user.profile_picture_id,
        });

        if (entity.profile_picture_id) {
            entity.profile_picture_url = await this.fileService.getFileUrlById(
                entity.profile_picture_id,
            );
        }

        return entity;
    }

    public async createMany(users: UserInput[]): Promise<UserEntity[]> {
        return Promise.all(users.map((user) => this.create(user)));
    }
}
