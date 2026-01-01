import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserEntity {
    @Expose()
    public id: string;

    @Expose()
    public email: string;

    @Expose()
    public name: string;

    @Expose()
    public user_type: string;

    @Expose()
    public identification: string;

    @Expose()
    public identification_type: string;

    @Expose()
    public provider: ProviderEntity | null;

    @Expose()
    public created_at: Date;

    @Expose()
    public phone: string | null;

    @Expose()
    public profile_picture_url: string | null;

    @ApiHideProperty()
    public updated_at: Date;

    @ApiHideProperty()
    public password: string;

    @ApiHideProperty()
    public refreshed_token: string | null;

    @ApiHideProperty()
    public profile_picture_id: string | null;

    public constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
