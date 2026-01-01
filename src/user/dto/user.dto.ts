import { PartialType, ApiSchema, OmitType, ApiProperty } from "@nestjs/swagger";
import { BaseUserDto } from "@app/common/dtos/base-user.dto";
import { IsOptional, IsString } from "class-validator";

@ApiSchema({ name: "UserCreate" })
export class UserCreateDto extends BaseUserDto {}

export class UserUpdateDto extends PartialType(OmitType(UserCreateDto, ["password"] as const)) {
    @ApiProperty({
        description: "Provider description",
        required: false,
    })
    @IsString()
    @IsOptional()
    public provider_description?: string;
}
