import { Module } from "@nestjs/common";
import { PdfService } from "./pdf.service";

@Module({
    providers: [PdfService],
})
export class PdfModule {}
