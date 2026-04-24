import { applyDecorators } from "@nestjs/common";
import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiBearerAuth,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiTags,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { LoginDto } from "@app/auth/dto/auth.dto";
import { BasicResponseEntity } from "@app/common/entities/response.entity";
import { UserAuthenticateEntity } from "../../entities/user-authenticate.entity";

const AUTH_TAG = "Seguridad y Acceso";

export function RegisterDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(AUTH_TAG),
        ApiOperation({
            summary: "Registro de nuevo cliente",
            description:
                "Permite crear una cuenta de usuario tipo **Cliente**. Tras el registro exitoso, el usuario podrá iniciar sesión con sus credenciales.",
        }),
        ApiCreatedResponse({
            description: "Usuario creado exitosamente.",
            type: BasicResponseEntity,
        }),
        ApiBadRequestResponse({
            description: "Datos de registro inválidos o el correo ya se encuentra registrado.",
        }),
    );
}

export function RegisterProviderDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(AUTH_TAG),
        ApiOperation({
            summary: "Registro de nuevo proveedor",
            description: `
Crea una cuenta de tipo **Proveedor**. Este flujo requiere la carga de documentos legales obligatorios.

### Documentos Requeridos (PDF):
- **RUT**: Registro Único Tributario.
- **Cámara de Comercio**: Certificado de existencia y representación legal.
            `,
        }),
        ApiConsumes("multipart/form-data"),
        ApiCreatedResponse({
            description: "Proveedor registrado exitosamente. Los documentos han sido recibidos.",
            type: BasicResponseEntity,
        }),
        ApiBadRequestResponse({
            description: "Error en la validación de archivos o datos del proveedor faltantes.",
        }),
    );
}

export function LoginDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(AUTH_TAG),
        ApiOperation({
            summary: "Inicio de sesión",
            description:
                "Valida las credenciales del usuario y retorna un **Access Token** (JWT) para autorizar peticiones y un **Refresh Token** para mantener la sesión activa.",
        }),
        ApiBody({ type: LoginDto }),
        ApiOkResponse({
            description: "Autenticación exitosa. Se retornan los tokens de acceso.",
            type: UserAuthenticateEntity,
        }),
        ApiUnauthorizedResponse({
            description: "Credenciales incorrectas (email o contraseña no coinciden).",
        }),
    );
}

export function RefreshTokenDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(AUTH_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Refrescar tokens de acceso",
            description:
                "Utiliza el **Refresh Token** actual para obtener un nuevo par de tokens (Access y Refresh) sin requerir que el usuario vuelva a loguearse.",
        }),
        ApiOkResponse({
            description: "Tokens renovados correctamente.",
            type: UserAuthenticateEntity,
        }),
        ApiUnauthorizedResponse({
            description: "El Refresh Token es inválido, ha expirado o no ha sido proporcionado.",
        }),
    );
}

export function LogOutDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(AUTH_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Cerrar sesión (Logout)",
            description:
                "Invalida la sesión actual del usuario en el servidor, revocando la validez del token proporcionado.",
        }),
        ApiOkResponse({
            description: "Sesión cerrada correctamente.",
            type: BasicResponseEntity,
        }),
        ApiUnauthorizedResponse({
            description: "Token de acceso no proporcionado o ya invalidado.",
        }),
    );
}
