import { Injectable } from "@nestjs/common";
import { QuoteEntity } from "@app/quote/entities/quote.entity";
import { quoteTemplate } from "@app/pdf/quotes/quote-template";

import pdfMake, { TCreatedPdf } from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { UserEntity } from "@app/user/entities/user.entity";

@Injectable()
export class PdfService {
    private generateDoc(template: TDocumentDefinitions): TCreatedPdf {
        pdfMake.vfs = pdfFonts.vfs;
        return pdfMake.createPdf(template);
    }

    private async generateBuffer(doc: TCreatedPdf): Promise<Buffer> {
        return new Promise<Buffer>((resolve) => {
            doc.getBuffer(function (buffer) {
                resolve(Buffer.from(buffer));
            });
        });
    }

    public async generateQuotePdf(quote: QuoteEntity, provider: UserEntity): Promise<Buffer> {
        const template = quoteTemplate(quote, provider);
        const doc = this.generateDoc(template);
        return this.generateBuffer(doc);
    }
}
