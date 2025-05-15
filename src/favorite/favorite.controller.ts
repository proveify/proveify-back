import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    UseGuards,
    Req,
    Query,
    HttpException,
    ClassSerializerInterceptor,
    UseInterceptors,
} from "@nestjs/common";
import { FavoriteService } from "./favorite.service";
import { JwtAuthGuard } from "@app/auth/guards/jwt.guard";
import { TokenPayload } from "@app/auth/interfaces/auth.interface";
import { Request } from "express";
import { FavoriteEntity } from "./entities/favorite.entity";
import { FavoriteParamsDto } from "./dto/favorite.dto";
import { ApiTags } from "@nestjs/swagger";
import {
    AddFavoriteDocumentation,
    RemoveFavoriteDocumentation,
    GetFavoritesDocumentation,
} from "./decorators/documentations/favorite.documentation";

@ApiTags("Favorites")
@Controller("favorites")
@UseInterceptors(ClassSerializerInterceptor)
export class FavoriteController {
    public constructor(private favoriteService: FavoriteService) {}

    @Post(":itemId")
    @UseGuards(JwtAuthGuard)
    @AddFavoriteDocumentation()
    public async addFavorite(
        @Req() req: Request & { user: TokenPayload },
        @Param("itemId") itemId: string,
    ): Promise<FavoriteEntity> {
        try {
            const favorite = await this.favoriteService.addFavorite(req.user.id, itemId);
            return new FavoriteEntity(favorite);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException("Failed to add item to favorites", 400);
        }
    }

    @Delete(":itemId")
    @UseGuards(JwtAuthGuard)
    @RemoveFavoriteDocumentation()
    public async removeFavorite(
        @Req() req: Request & { user: TokenPayload },
        @Param("itemId") itemId: string,
    ): Promise<FavoriteEntity> {
        try {
            const favorite = await this.favoriteService.removeFavorite(req.user.id, itemId);
            return new FavoriteEntity(favorite);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException("Failed to remove item from favorites", 400);
        }
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @GetFavoritesDocumentation()
    public async getFavorites(
        @Req() req: Request & { user: TokenPayload },
        @Query() params: FavoriteParamsDto,
    ): Promise<FavoriteEntity[]> {
        const favorites = await this.favoriteService.getFavorites(req.user.id, params);
        return favorites.map((favorite) => new FavoriteEntity(favorite));
    }
}
