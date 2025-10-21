import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpException,
    HttpStatus,
    UseInterceptors,
    ClassSerializerInterceptor,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { BasicResponseEntity } from "@app/common/entities/response.entity";
import { PublicRequestService } from "./public-request.service";
import {
    CreatePublicRequestDto,
    UpdatePublicRequestDto,
    PublicRequestParamsDto,
    PublicRequestFilterDto,
} from "./dto/public-request.dto";
import { PublicRequestEntity } from "./entities/public-request.entity";
import {
    CreatePublicRequestDocumentation,
    GetPublicRequestsDocumentation,
    GetPublicRequestDocumentation,
    UpdatePublicRequestDocumentation,
    DeletePublicRequestDocumentation,
    GetMyPublicRequestsDocumentation,
    GetPublicRequestProviderQuotesDocumentation,
} from "./decorators/documentations/public-request.documentation";
import { ProviderQuoteEntity } from "@app/provider-quote/entities/provider-quote.entity";

@ApiTags("Public Requests")
@Controller("public-requests")
@UseInterceptors(ClassSerializerInterceptor)
export class PublicRequestController {
    public constructor(private readonly publicRequestService: PublicRequestService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @CreatePublicRequestDocumentation()
    public async create(
        @Body() createPublicRequestDto: CreatePublicRequestDto,
    ): Promise<PublicRequestEntity> {
        return await this.publicRequestService.create(createPublicRequestDto);
    }

    @Get()
    @GetPublicRequestsDocumentation()
    public async findAll(@Query() params: PublicRequestFilterDto): Promise<PublicRequestEntity[]> {
        return await this.publicRequestService.findAll(params);
    }

    @Get("my-requests")
    @UseGuards(JwtAuthGuard)
    @GetMyPublicRequestsDocumentation()
    public async findMyRequests(
        @Query() params: PublicRequestParamsDto,
    ): Promise<PublicRequestEntity[]> {
        return await this.publicRequestService.findMyRequests(params);
    }

    @Get(":id")
    @GetPublicRequestDocumentation()
    public async findOne(@Param("id") id: string): Promise<PublicRequestEntity> {
        const publicRequest = await this.publicRequestService.findOne(id);

        if (!publicRequest) {
            throw new HttpException("Public request not found", HttpStatus.NOT_FOUND);
        }

        return publicRequest;
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    @UpdatePublicRequestDocumentation()
    public async update(
        @Param("id") id: string,
        @Body() updatePublicRequestDto: UpdatePublicRequestDto,
    ): Promise<PublicRequestEntity> {
        return await this.publicRequestService.update(id, updatePublicRequestDto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @DeletePublicRequestDocumentation()
    public async remove(@Param("id") id: string): Promise<BasicResponseEntity> {
        await this.publicRequestService.remove(id);

        return {
            code: 200,
            message: "Public request deleted successfully",
        };
    }

    @Get(":id/provider-quotes")
    @GetPublicRequestProviderQuotesDocumentation()
    public async getProviderQuotes(
        @Param("id") id: string,
        @Query() params: PublicRequestParamsDto,
    ): Promise<ProviderQuoteEntity[]> {
        const quotes = await this.publicRequestService.getProviderQuotesByPublicRequest(id, params);
        return quotes.map((quote) => new ProviderQuoteEntity(quote));
    }
}
