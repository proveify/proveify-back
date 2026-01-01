import { IsOptional } from "class-validator";
import { PartialType, ApiProperty, ApiSchema, OmitType } from "@nestjs/swagger";
import { ProviderUpdateWithoutFilesDto } from "@app/provider/dto/provider.dto";
import { Type } from "class-transformer";
import { BaseUserDto } from "@app/common/dtos/base-user.dto";
import { HasMimeType, IsFile, MemoryStoredFile } from "nestjs-form-data";

@ApiSchema({ name: "UserCreate" })
export class UserCreateDto extends BaseUserDto {}

export class UserUpdateDto extends PartialType(OmitType(UserCreateDto, ["password"] as const)) {
    @IsOptional()
    @ApiProperty({
        description: "update provider data only if user has a provider",
        type: () => ProviderUpdateWithoutFilesDto,
        required: false,
    })
    @Type(() => ProviderUpdateWithoutFilesDto)
    public provider?: ProviderUpdateWithoutFilesDto;
}

export class UserUpdateProfilePicture {
    @ApiProperty({
        description: "profile picture",
        type: "string",
        format: "binary",
    })
    @IsFile()
    @HasMimeType(["image/jpeg", "image/png"])
    public image: MemoryStoredFile;
}
