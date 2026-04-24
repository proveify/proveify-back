import { applyDecorators } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { PaymentEntity } from "../../entities/payment.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";

const PAYMENT_TAG = "Pagos";

export function InitiatePaymentDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PAYMENT_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Iniciar un pago para una cotización aprobada",
            description:
                "Crea un registro de pago y genera la firma de integridad y la llave pública necesaria para renderizar el widget de checkout de Wompi. Este paso es obligatorio antes de procesar la transacción.",
        }),
        ApiCreatedResponse({
            description:
                "Pago iniciado exitosamente. Se retornan los datos necesarios para el checkout.",
            type: PaymentEntity,
        }),
        ApiBadRequestResponse({
            description: "La cotización no se encuentra en estado 'aprobada'.",
        }),
        ApiNotFoundResponse({ description: "Cotización no encontrada." }),
        ApiConflictResponse({
            description: "Ya existe un proceso de pago activo para esta cotización.",
        }),
    );
}

export function WebhookPaymentDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PAYMENT_TAG),
        ApiOperation({
            summary: "Receptor de eventos Webhook de Wompi",
            description:
                "Endpoint asíncrono que recibe notificaciones sobre cambios en el estado de las transacciones desde Wompi. Verifica la firma de seguridad antes de actualizar el estado del pago en el sistema.",
        }),
        ApiOkResponse({
            description: "Evento procesado correctamente.",
            type: BasicResponseEntity,
        }),
        ApiUnauthorizedResponse({ description: "Firma del webhook inválida o no autorizada." }),
    );
}

export function GetPaymentDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiTags(PAYMENT_TAG),
        ApiBearerAuth(),
        ApiOperation({
            summary: "Consultar estado de pago por referencia",
            description:
                "Recupera la información detallada y el estado actual de un pago utilizando su referencia única.",
        }),
        ApiParam({
            name: "reference",
            required: true,
            type: String,
            description: "Referencia única del pago.",
            example: "PRV-1234567890-abcd1234",
        }),
        ApiOkResponse({
            description: "Información del pago encontrada exitosamente.",
            type: PaymentEntity,
        }),
        ApiNotFoundResponse({
            description: "No se encontró ningún pago con la referencia proporcionada.",
        }),
    );
}
