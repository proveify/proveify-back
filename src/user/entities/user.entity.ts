import { ProviderEntity } from "@app/provider/entities/provider.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class UserEntity {
    public id: string;
    public email: string;
    public name: string;
    public user_type: string;
    public identification: string;
    public identification_type: string;

    public Provider: ProviderEntity | null;
    public created_at: Date;
    public updated_at: Date;

    @ApiHideProperty()
    @Exclude()
    public password: string;

    @ApiHideProperty()
    @Exclude()
    public refreshed_token: string | null;

    public constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
