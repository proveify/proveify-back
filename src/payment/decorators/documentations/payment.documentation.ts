import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { PaymentEntity } from "../../entities/payment.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";

export function InitiatePaymentDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Initiate a payment for an approved quote",
            description:
                "Creates a payment record and returns the integrity signature and public key required to render the Wompi checkout widget.",
        }),
        ApiResponse({
            status: 201,
            description: "Payment initiated successfully",
            type: PaymentEntity,
        }),
        ApiResponse({ status: 400, description: "Quote is not in approved status" }),
        ApiResponse({ status: 404, description: "Quote not found" }),
        ApiResponse({ status: 409, description: "Payment already exists for this quote" }),
        ApiBearerAuth(),
    );
}

export function WebhookPaymentDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Wompi webhook event receiver",
            description:
                "Receives transaction status events from Wompi and updates the payment record accordingly. Signature is verified before processing.",
        }),
        ApiResponse({
            status: 200,
            description: "Event processed",
            type: BasicResponseEntity,
        }),
        ApiResponse({ status: 401, description: "Invalid webhook signature" }),
    );
}

export function GetPaymentDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({
            summary: "Get payment status by reference",
            description: "Returns the current state of a payment by its unique reference.",
        }),
        ApiParam({
            name: "reference",
            required: true,
            type: String,
            description: "Payment reference",
            example: "PRV-1234567890-abcd1234",
        }),
        ApiResponse({
            status: 200,
            description: "Payment found",
            type: PaymentEntity,
        }),
        ApiResponse({ status: 404, description: "Payment not found" }),
        ApiBearerAuth(),
    );
}
