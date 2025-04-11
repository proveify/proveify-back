import type { UserResponse } from "../../interfaces/user-response/user-response.interface";
import type { Users as UserModel } from "@prisma/client";

export class UserMapper {
    public static toUserResponse(user: UserModel): UserResponse {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            identification: user.identification,
            identification_type: user.identification_type,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }
}
