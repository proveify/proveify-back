import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { PaymentEntity } from "../../entities/payment.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";

export function InitiatePaymentDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Initiate a plan subscription payment" }),
        ApiResponse({
            status: 201,
            description: "Payment initiated successfully",
            type: PaymentEntity,
        }),
        ApiResponse({ status: 400, description: "Plan does not require payment" }),
        ApiResponse({ status: 403, description: "User does not have a provider profile" }),
        ApiResponse({ status: 404, description: "Plan not found" }),
        ApiResponse({ status: 409, description: "A pending payment already exists for this plan" }),
        ApiBearerAuth(),
    );
}

export function WebhookPaymentDocumentation(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiOperation({ summary: "Wompi webhook receiver" }),
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
        ApiOperation({ summary: "Get payment by reference" }),
        ApiResponse({
            status: 200,
            description: "Payment found",
            type: PaymentEntity,
        }),
        ApiResponse({ status: 404, description: "Payment not found" }),
        ApiBearerAuth(),
    );
}
