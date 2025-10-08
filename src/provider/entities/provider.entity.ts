import { Exclude, Expose } from "class-transformer";
import { ApiHideProperty } from "@nestjs/swagger";

export class ProviderEntity {
    public id: string;
    public name: string;
    public email: string;
    public identification: string;
    public identification_type: string;

    @ApiHideProperty()
    @Exclude()
    public rut: string;

    @ApiHideProperty()
    @Exclude()
    public chamber_commerce: string;

    @Expose({ groups: ["owner"] })
    public created_at: Date;

    @Expose({ groups: ["owner"] })
    public updated_at: Date;

    @Expose({ groups: ["owner"] })
    public plan_id: string;

    @Expose({ groups: ["owner"] })
    public user_id: string;

    @ApiHideProperty()
    @Exclude()
    public profile_picture: string | null;

    @Expose()
    public profile_picture_url: string | null = null;

    @Expose({ groups: ["owner"] })
    public rut_file_url: string | null = null;

    @Expose({ groups: ["owner"] })
    public chamber_commerce_file_url: string | null = null;

    public constructor(partial: Partial<ProviderEntity>) {
        Object.assign(this, partial);
    }
}
