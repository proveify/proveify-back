import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { BasicResponseEntity } from "@app/common/entities/response.entity";
import { QuoteService } from "./quote.service";
import {
    CreateQuoteDto,
    QuoteFilterDto,
    QuoteMessageParamsDto,
    QuoteParamsDto,
    UpdateQuoteDto,
} from "./dto/quote.dto";
import { QuoteEntity, QuoteMessageEntity } from "./entities/quote.entity";
import {
    CreateQuoteDocumentation,
    DeleteQuoteDocumentation,
    GetMyQuotesDocumentation,
    GetQuoteDocumentation,
    GetQuotesDocumentation,
    UpdateQuoteDocumentation,
} from "./decorators/documentations/quote.documentation";
import { TransactionInterceptor } from "@app/prisma/interceptors/transaction.interceptor";
import { UserTypes } from "@app/user/interfaces/users";

@ApiTags("Quotes")
@Controller("quotes")
@UseInterceptors(ClassSerializerInterceptor)
export class QuoteController {
    public constructor(private readonly quoteService: QuoteService) {}

    @Post()
    @CreateQuoteDocumentation()
    public async create(@Body() createQuoteDto: CreateQuoteDto): Promise<QuoteEntity> {
        const quote = await this.quoteService.create(createQuoteDto);
        return new QuoteEntity(quote);
    }

    @Get()
    @GetQuotesDocumentation()
    public async findAll(@Query() params: QuoteFilterDto): Promise<QuoteEntity[]> {
        const quotes = await this.quoteService.findAll(params);
        return quotes.map((quote) => new QuoteEntity(quote));
    }

    @Get("provider/my-quotes")
    @UseGuards(JwtAuthGuard)
    @GetMyQuotesDocumentation()
    public async findMyQuotes(@Query() params: QuoteParamsDto): Promise<QuoteEntity[]> {
        const quotes = await this.quoteService.findMyQuotes(params);
        return quotes.map((quote) => new QuoteEntity(quote));
    }

    @Get(":id")
    @GetQuoteDocumentation()
    public async findOne(@Param("id") id: string): Promise<QuoteEntity> {
        const quote = await this.quoteService.findOne(id);

        if (!quote) {
            throw new HttpException("Quote not found", HttpStatus.NOT_FOUND);
        }

        return new QuoteEntity(quote);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    @UpdateQuoteDocumentation()
    @UseInterceptors(TransactionInterceptor)
    public async update(
        @Param("id") id: string,
        @Body() updateQuoteDto: UpdateQuoteDto,
    ): Promise<QuoteEntity> {
        const updatedQuote = await this.quoteService.update(id, updateQuoteDto);
        return new QuoteEntity(updatedQuote);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @DeleteQuoteDocumentation()
    @UseInterceptors(TransactionInterceptor)
    public async remove(@Param("id") id: string): Promise<BasicResponseEntity> {
        await this.quoteService.remove(id);

        return {
            code: 200,
            message: "Quote deleted successfully",
        };
    }

    @Get(":id/messages")
    @UseGuards(JwtAuthGuard)
    public async getQuoteMessages(
        @Param("id") id: string,
        @Query() params: QuoteMessageParamsDto,
    ): Promise<QuoteMessageEntity[]> {
        if (!params.getAs) params.getAs = UserTypes.CLIENT;
        return this.quoteService.getQuoteMessages(id, params);
    }
}
