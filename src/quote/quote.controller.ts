import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { QuoteService } from "./quote.service";
import { QuoteGroupEntity } from "./entities/quote.entity";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { QuoteDto } from "./dto/quote.dto";
import { JwtOptionalGuard } from "@app/auth/guards/jwt-optional-guard";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";

@Controller("quotes")
export class QuoteController {
    public constructor(private readonly quoteService: QuoteService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    public async getClientQuotes(): Promise<QuoteGroupEntity[]> {
        const quotes = await this.quoteService.getClientQuoteGroups();
        return quotes.map((quote) => new QuoteGroupEntity(quote));
    }

    @UseGuards(JwtOptionalGuard)
    @Post()
    public async createQuoteGroup(
        @Body() data: QuoteDto,
        @Req() req: Request & { user?: TokenPayload },
    ): Promise<QuoteGroupEntity> {
        const quote = await this.quoteService.createQuoteGroup(data, req.user?.id);
        return new QuoteGroupEntity(quote);
    }
}
