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
import { ProviderQuoteService } from "./provider-quote.service";
import {
    CreateProviderQuoteDto,
    UpdateProviderQuoteDto,
    ProviderQuoteParamsDto,
} from "./dto/provider-quote.dto";
import { ProviderQuoteEntity } from "./entities/provider-quote.entity";
import {
    CreateProviderQuoteDocumentation,
    GetProviderQuotesDocumentation,
    GetProviderQuoteDocumentation,
    GetMyProviderQuotesDocumentation,
    UpdateProviderQuoteDocumentation,
    DeleteProviderQuoteDocumentation,
} from "./decorators/documentations/provider-quote.documentation";
import { TransactionInterceptor } from "@app/prisma/interceptors/transaction.interceptor";

@ApiTags("Provider Quotes")
@Controller("provider-quotes")
@UseInterceptors(ClassSerializerInterceptor)
export class ProviderQuoteController {
    public constructor(private readonly providerQuoteService: ProviderQuoteService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @CreateProviderQuoteDocumentation()
    @UseInterceptors(TransactionInterceptor)
    public async create(
        @Body() createProviderQuoteDto: CreateProviderQuoteDto,
    ): Promise<ProviderQuoteEntity> {
        const quote = await this.providerQuoteService.create(createProviderQuoteDto);
        return new ProviderQuoteEntity(quote);
    }

    @Get()
    @GetProviderQuotesDocumentation()
    public async findAll(@Query() params: ProviderQuoteParamsDto): Promise<ProviderQuoteEntity[]> {
        const quotes = await this.providerQuoteService.findAll(params);
        return quotes.map((quote) => new ProviderQuoteEntity(quote));
    }

    @Get("my-quotes")
    @UseGuards(JwtAuthGuard)
    @GetMyProviderQuotesDocumentation()
    public async findMyQuotes(
        @Query() params: ProviderQuoteParamsDto,
    ): Promise<ProviderQuoteEntity[]> {
        const quotes = await this.providerQuoteService.findMyQuotes(params);
        return quotes.map((quote) => new ProviderQuoteEntity(quote));
    }

    @Get(":id")
    @GetProviderQuoteDocumentation()
    public async findOne(@Param("id") id: string): Promise<ProviderQuoteEntity> {
        const quote = await this.providerQuoteService.findOne(id);

        if (!quote) {
            throw new HttpException("Provider quote not found", HttpStatus.NOT_FOUND);
        }

        return new ProviderQuoteEntity(quote);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    @UpdateProviderQuoteDocumentation()
    @UseInterceptors(TransactionInterceptor)
    public async update(
        @Param("id") id: string,
        @Body() updateProviderQuoteDto: UpdateProviderQuoteDto,
    ): Promise<ProviderQuoteEntity> {
        const updatedQuote = await this.providerQuoteService.update(id, updateProviderQuoteDto);
        return new ProviderQuoteEntity(updatedQuote);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @DeleteProviderQuoteDocumentation()
    @UseInterceptors(TransactionInterceptor)
    public async remove(@Param("id") id: string): Promise<BasicResponseEntity> {
        await this.providerQuoteService.remove(id);

        return {
            code: 200,
            message: "Provider quote deleted successfully",
        };
    }
}
