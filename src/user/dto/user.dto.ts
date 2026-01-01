import { PartialType, ApiSchema, OmitType } from "@nestjs/swagger";
import { BaseUserDto } from "@app/common/dtos/base-user.dto";

@ApiSchema({ name: "UserCreate" })
export class UserCreateDto extends BaseUserDto {}

export class UserUpdateDto extends PartialType(OmitType(UserCreateDto, ["password"] as const)) {}
