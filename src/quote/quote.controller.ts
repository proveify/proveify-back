import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Res,
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
import { QuoteEntity } from "./entities/quote.entity";
import {
    CreateQuoteDocumentation,
    DeleteQuoteDocumentation,
    GetMyQuotesDocumentation,
    GetQuoteDocumentation,
    GetQuotesDocumentation,
    PrintQuoteDocumentation,
    UpdateQuoteDocumentation,
} from "./decorators/documentations/quote.documentation";
import { TransactionInterceptor } from "@app/prisma/interceptors/transaction.interceptor";
import { UserTypes } from "@app/user/interfaces/users";
import { QuoteMessageEntity } from "@app/quote/entities/quote-message.entity";
import { OwnerSerializerInterceptor } from "@app/common/interceptors/owner-serializer.interceptor";
import { LoadUser } from "@app/common/decorators/load-user.decorator";
import { Response } from "express";

@ApiTags("Quotes")
@Controller("quotes")
@UseInterceptors(OwnerSerializerInterceptor)
export class QuoteController {
    public constructor(private readonly quoteService: QuoteService) {}

    @Post()
    @CreateQuoteDocumentation()
    public async create(@Body() createQuoteDto: CreateQuoteDto): Promise<QuoteEntity> {
        return this.quoteService.create(createQuoteDto);
    }

    @Get()
    @GetQuotesDocumentation()
    public async findAll(@Query() params: QuoteFilterDto): Promise<QuoteEntity[]> {
        return this.quoteService.findAll(params);
    }

    @Get("provider/my-quotes")
    @UseGuards(JwtAuthGuard)
    @GetMyQuotesDocumentation()
    public async findMyQuotes(@Query() params: QuoteParamsDto): Promise<QuoteEntity[]> {
        return this.quoteService.findMyQuotes(params);
    }

    @Get(":id")
    @GetQuoteDocumentation()
    public async findOne(@Param("id") id: string): Promise<QuoteEntity> {
        const quote = await this.quoteService.findOne(id);

        if (!quote) {
            throw new HttpException("Quote not found", HttpStatus.NOT_FOUND);
        }

        return quote;
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    @UpdateQuoteDocumentation()
    @UseInterceptors(TransactionInterceptor)
    public async update(
        @Param("id") id: string,
        @Body() updateQuoteDto: UpdateQuoteDto,
    ): Promise<QuoteEntity> {
        return this.quoteService.update(id, updateQuoteDto);
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

    @Get(":id/print")
    @UseGuards(JwtAuthGuard)
    @PrintQuoteDocumentation()
    @LoadUser()
    public async generatePrint(@Param("id") id: string, @Res() res: Response): Promise<void> {
        const buffer = await this.quoteService.generatePrint(id);
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="quote-${id}.pdf"`,
            "Content-Length": buffer.length,
        });
        res.end(buffer);
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
