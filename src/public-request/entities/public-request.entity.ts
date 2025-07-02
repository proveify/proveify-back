import { UserEntity } from "@app/user/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

export class PublicRequestEntity {
    @ApiProperty({
        description: "ID único de la solicitud pública",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public id: string;

    @ApiProperty({
        description: "Título de la solicitud",
        example: "Necesito servicios de diseño gráfico",
    })
    public title: string;

    @ApiProperty({
        description: "ID del usuario que creó la solicitud",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    public user_id: string;

    @ApiProperty({
        description: "Descripción detallada de la solicitud (puede contener HTML)",
        example:
            "<p>Busco diseñador para crear <strong>logo</strong> y <em>identidad corporativa</em> completa.</p>",
    })
    public description: string;

    @ApiProperty({
        description: "Fecha de creación",
        example: "2025-06-09T10:30:00Z",
    })
    public created_at: Date;

    @ApiProperty({
        description: "Fecha de última actualización",
        example: "2025-06-09T10:30:00Z",
    })
    public updated_at: Date;

    @ApiProperty({
        type: UserEntity,
        required: false,
        description: "Información del usuario que creó la solicitud",
    })
    public user?: UserEntity;

    public constructor(partial: Partial<PublicRequestEntity>) {
        Object.assign(this, partial);
    }
}
