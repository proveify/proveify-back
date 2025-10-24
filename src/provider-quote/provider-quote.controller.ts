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
        return await this.providerQuoteService.create(createProviderQuoteDto);
    }

    @Get()
    @GetProviderQuotesDocumentation()
    public async findAll(@Query() params: ProviderQuoteParamsDto): Promise<ProviderQuoteEntity[]> {
        return await this.providerQuoteService.findAll(params);
    }

    @Get("my-quotes")
    @UseGuards(JwtAuthGuard)
    @GetMyProviderQuotesDocumentation()
    public async findMyQuotes(
        @Query() params: ProviderQuoteParamsDto,
    ): Promise<ProviderQuoteEntity[]> {
        return await this.providerQuoteService.findMyQuotes(params);
    }

    @Get(":id")
    @GetProviderQuoteDocumentation()
    public async findOne(@Param("id") id: string): Promise<ProviderQuoteEntity> {
        const quote = await this.providerQuoteService.findOne(id);

        if (!quote) {
            throw new HttpException("Provider quote not found", HttpStatus.NOT_FOUND);
        }

        return quote;
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    @UpdateProviderQuoteDocumentation()
    @UseInterceptors(TransactionInterceptor)
    public async update(
        @Param("id") id: string,
        @Body() updateProviderQuoteDto: UpdateProviderQuoteDto,
    ): Promise<ProviderQuoteEntity> {
        return await this.providerQuoteService.update(id, updateProviderQuoteDto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @DeleteProviderQuoteDocumentation()
    @UseInterceptors(TransactionInterceptor)
    public async remove(@Param("id") id: string): Promise<ProviderQuoteEntity> {
        return await this.providerQuoteService.remove(id);
    }
}
