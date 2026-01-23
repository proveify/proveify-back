import { Exclude, Expose } from "class-transformer";
import { ApiHideProperty } from "@nestjs/swagger";
import { UserEntity } from "@app/user/entities/user.entity";

@Exclude()
export class ProviderEntity {
    @Expose()
    public id: string;

    @ApiHideProperty()
    public rut: string;

    @ApiHideProperty()
    public chamber_commerce: string;

    @Expose({ groups: ["owner"] })
    public created_at: Date;

    @Expose({ groups: ["owner"] })
    public plan_id: string;

    @Expose({ groups: ["owner"] })
    public user_id: string;

    @Expose({ groups: ["owner"] })
    public rut_file_url: string | null;

    @Expose({ groups: ["owner"] })
    public chamber_commerce_file_url: string | null;

    @Expose()
    public description: string | null;

    @Expose()
    public user: UserEntity | null = null;

    public constructor(partial: Partial<ProviderEntity>) {
        Object.assign(this, partial);
    }
}
