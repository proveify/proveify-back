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
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { BasicResponseEntity } from "@app/configs/entities/response.entity";
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
} from "./decorators/documentations/public-request.documentation";

@ApiTags("Public Requests")
@Controller("public-requests")
export class PublicRequestController {
    public constructor(private readonly publicRequestService: PublicRequestService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @CreatePublicRequestDocumentation()
    public async create(
        @Body() createPublicRequestDto: CreatePublicRequestDto,
    ): Promise<PublicRequestEntity> {
        const publicRequest = await this.publicRequestService.create(createPublicRequestDto);
        return new PublicRequestEntity(publicRequest);
    }

    @Get()
    @GetPublicRequestsDocumentation()
    public async findAll(@Query() params: PublicRequestFilterDto): Promise<PublicRequestEntity[]> {
        const publicRequests = await this.publicRequestService.findAll(params);
        return publicRequests.map((request) => new PublicRequestEntity(request));
    }

    @Get("my-requests")
    @UseGuards(JwtAuthGuard)
    @GetMyPublicRequestsDocumentation()
    public async findMyRequests(
        @Query() params: PublicRequestParamsDto,
    ): Promise<PublicRequestEntity[]> {
        const publicRequests = await this.publicRequestService.findMyRequests(params);
        return publicRequests.map((request) => new PublicRequestEntity(request));
    }

    @Get(":id")
    @GetPublicRequestDocumentation()
    public async findOne(@Param("id") id: string): Promise<PublicRequestEntity> {
        const publicRequest = await this.publicRequestService.findOne(id);

        if (!publicRequest) {
            throw new HttpException("Public request not found", HttpStatus.NOT_FOUND);
        }

        return new PublicRequestEntity(publicRequest);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    @UpdatePublicRequestDocumentation()
    public async update(
        @Param("id") id: string,
        @Body() updatePublicRequestDto: UpdatePublicRequestDto,
    ): Promise<PublicRequestEntity> {
        const updatedRequest = await this.publicRequestService.update(id, updatePublicRequestDto);
        return new PublicRequestEntity(updatedRequest);
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
}
