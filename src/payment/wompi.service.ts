import { Inject, Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { wompiConfig } from "@app/common/base.config";
import type { ConfigType } from "@nestjs/config";

@Injectable()
export class WompiService {
    public constructor(
        @Inject(wompiConfig.KEY)
        private readonly config: ConfigType<typeof wompiConfig>,
    ) {}

    public generateIntegritySignature(
        reference: string,
        amountInCents: number,
        currency: string,
    ): string {
        const chain = `${reference}${amountInCents}${currency}${this.config.integritySecret}`;
        return createHash("sha256").update(chain).digest("hex");
    }

    public verifyWebhookSignature(
        properties: Record<string, unknown>,
        timestamp: number,
        checksum: string,
    ): boolean {
        const propertiesString = JSON.stringify(properties);
        const chain = `${propertiesString}${timestamp}${this.config.secretEvent}`;
        const computed = createHash("sha256").update(chain).digest("hex");
        return computed === checksum;
    }

    public getPublicKey(): string {
        return this.config.publicKey ?? "";
    }
}
