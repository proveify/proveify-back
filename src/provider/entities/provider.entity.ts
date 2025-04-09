import { ApiHideProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

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

    @ApiHideProperty()
    @Exclude()
    public created_at: Date;

    @ApiHideProperty()
    @Exclude()
    public updated_at: Date;

    @ApiHideProperty()
    @Exclude()
    public plan_id: string;

    @ApiHideProperty()
    @Exclude()
    public user_id: string;

    public constructor(partial: Partial<ProviderEntity>) {
        Object.assign(this, partial);
    }
}
