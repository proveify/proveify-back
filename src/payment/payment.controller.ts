import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { LoadUser } from "@app/common/decorators/load-user.decorator";
import { OwnerSerializerInterceptor } from "@app/common/interceptors/owner-serializer.interceptor";
import { PaymentService } from "./payment.service";
import { InitiatePaymentDto } from "./dto/payment.dto";
import { PaymentEntity } from "./entities/payment.entity";
import { BasicResponseEntity } from "@app/common/entities/response.entity";
import {
    GetPaymentDocumentation,
    InitiatePaymentDocumentation,
    WebhookPaymentDocumentation,
} from "./decorators/documentations/payment.documentation";

@ApiTags("Payments")
@Controller("payments")
@UseInterceptors(OwnerSerializerInterceptor)
export class PaymentController {
    public constructor(private readonly paymentService: PaymentService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @LoadUser()
    @InitiatePaymentDocumentation()
    public async initiate(@Body() dto: InitiatePaymentDto): Promise<PaymentEntity> {
        return this.paymentService.initiatePayment(dto);
    }

    @Post("webhook")
    @HttpCode(HttpStatus.OK)
    @WebhookPaymentDocumentation()
    public async webhook(
        @Body()
        body: {
            event: string;
            data: { transaction: { id: string; reference: string; status: string; amount_in_cents: number } };
            timestamp: number;
            signature: { checksum: string; properties: string[] };
        },
    ): Promise<BasicResponseEntity> {
        return this.paymentService.handleWebhookEvent(
            body.event,
            body.data,
            body.timestamp,
            body.signature.checksum,
        );
    }

    @Get(":reference")
    @UseGuards(JwtAuthGuard)
    @LoadUser()
    @GetPaymentDocumentation()
    public async findOne(@Param("reference") reference: string): Promise<PaymentEntity> {
        return this.paymentService.findByReference(reference);
    }
}
