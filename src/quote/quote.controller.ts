import { Body, Controller, Get, HttpException, Param, Post, Req, UseGuards } from "@nestjs/common";
import { QuoteService } from "./quote.service";
import { QuoteEntity } from "./entities/quote.entity";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { QuoteDto, QuoteUploadFileDto } from "./dto/quote.dto";
import { JwtOptionalGuard } from "@app/auth/guards/jwt-optional-guard";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import { FormDataRequest } from "nestjs-form-data";

@Controller("quotes")
export class QuoteController {
    public constructor(private readonly quoteService: QuoteService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    public async getClientQuotes(): Promise<QuoteEntity[]> {
        const quotes = await this.quoteService.getClientQuotes();
        return quotes.map((quote) => new QuoteEntity(quote));
    }

    @UseGuards(JwtAuthGuard)
    @Get("provider")
    public async getProviderQuotes(): Promise<QuoteEntity[]> {
        const quotes = await this.quoteService.getProviderQuotes();
        return quotes.map((quote) => new QuoteEntity(quote));
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    public async getQuoteById(@Param() params: { id: string }): Promise<QuoteEntity> {
        const quote = await this.quoteService.getQuoteById(params.id);

        if (!quote) {
            throw new HttpException("Quote not found", 404);
        }

        const isValid = this.quoteService.validateQuoteUserAndProvider(quote);

        if (!isValid) {
            throw new HttpException("Quote not found", 404);
        }

        return new QuoteEntity(quote);
    }

    @UseGuards(JwtOptionalGuard)
    @Post()
    public async createQuote(
        @Body() data: QuoteDto,
        @Req() req: Request & { user?: TokenPayload },
    ): Promise<QuoteEntity> {
        const quote = await this.quoteService.createQuote(data, req.user?.id);
        return new QuoteEntity(quote);
    }

    @UseGuards(JwtAuthGuard)
    @FormDataRequest()
    @Post(":id/upload")
    public async uploadQuoteFile(
        @Body() data: QuoteUploadFileDto,
        @Param() params: { id: string },
    ): Promise<QuoteEntity> {
        const quote = await this.quoteService.uploadQuoteFile(params.id, data.file);

        return new QuoteEntity(quote);
    }
}
