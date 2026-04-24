import { applyDecorators } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
} from "@nestjs/swagger";
import { UserEntity } from "../../entities/user.entity";

const USER_TAG = "Gestión de Cuenta";

export function GetUserProfileDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(USER_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Obtener información del perfil",
            description: `
Retorna los datos completos del usuario que ha iniciado sesión. 

### Información incluida:
- **Datos básicos**: Nombre, email, identificación.
- **Tipo de cuenta**: Cliente o Proveedor.
- **Detalles comerciales**: Si el usuario es un proveedor, se incluye su información de empresa vinculada.
            `,
        }),
        ApiOkResponse({
            description: "Perfil de usuario recuperado exitosamente.",
            type: UserEntity,
        }),
        ApiUnauthorizedResponse({
            description: "Token de acceso inválido, expirado o no proporcionado.",
        }),
        ApiNotFoundResponse({
            description: "El usuario no existe en los registros actuales.",
        }),
    );
}

export function UpdateUserDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(USER_TAG),
        ApiBearerAuth(),
        ApiConsumes("multipart/form-data"),
        ApiOperation({
            summary: "Actualizar datos del perfil",
            description: `
Permite modificar la información del perfil del usuario autenticado. 

Si el usuario es un **Proveedor**, este endpoint permite actualizar campos específicos como la descripción comercial o subir nuevos documentos legales.
            `,
        }),
        ApiOkResponse({
            description:
                "Perfil actualizado correctamente. Se retorna la entidad de usuario actualizada.",
            type: UserEntity,
        }),
        ApiUnauthorizedResponse({
            description:
                "No se proporcionaron credenciales válidas para realizar la actualización.",
        }),
        ApiNotFoundResponse({
            description: "No se pudo encontrar el usuario para aplicar los cambios.",
        }),
    );
}
