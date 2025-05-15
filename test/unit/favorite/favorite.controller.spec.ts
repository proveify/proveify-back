import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteController } from "../../../src/favorite/favorite.controller";
import { FavoriteService } from "../../../src/favorite/favorite.service";
import { ClassSerializerInterceptor, HttpException } from "@nestjs/common";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { Reflector } from "@nestjs/core";
import { FavoriteEntity } from "../../../src/favorite/entities/favorite.entity";
import { plainToInstance } from "class-transformer";

const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

const mockFavoriteService = {
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    getFavorites: jest.fn(),
};

describe("FavoriteController", () => {
    let controller: FavoriteController;
    let favoriteService: FavoriteService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FavoriteController],
            providers: [
                {
                    provide: FavoriteService,
                    useValue: mockFavoriteService,
                },
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .overrideInterceptor(ClassSerializerInterceptor)
            .useValue({
                intercept: jest.fn().mockImplementation((_, next) => next.handle()),
            })
            .compile();

        controller = module.get<FavoriteController>(FavoriteController);
        favoriteService = module.get<FavoriteService>(FavoriteService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("addFavorite", () => {
        it("should add an item to favorites successfully", async () => {
            const mockFavorite = {
                id: "favorite-id",
                user_id: "test-user-id",
                item_id: "item-id",
                created_at: new Date(),
            };

            const mockRequest = {
                user: { id: "test-user-id" },
            };

            mockFavoriteService.addFavorite.mockResolvedValue(mockFavorite);

            const result = await controller.addFavorite(mockRequest as any, "item-id");

            const serialized = plainToInstance(FavoriteEntity, result, { 
                excludeExtraneousValues: false 
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("favorite-id");
            expect(serialized.user_id).toBe("test-user-id");
            expect(serialized.item_id).toBe("item-id");
            expect(favoriteService.addFavorite).toHaveBeenCalledWith("test-user-id", "item-id");
        });

        it("should handle HttpException from service", async () => {
            const mockRequest = {
                user: { id: "test-user-id" },
            };

            const error = new HttpException("Item not found", 404);
            mockFavoriteService.addFavorite.mockRejectedValue(error);

            await expect(controller.addFavorite(mockRequest as any, "item-id")).rejects.toThrow(error);
        });

        it("should handle generic errors", async () => {
            const mockRequest = {
                user: { id: "test-user-id" },
            };

            mockFavoriteService.addFavorite.mockRejectedValue(new Error("Database error"));

            await expect(controller.addFavorite(mockRequest as any, "item-id")).rejects.toThrow(
                new HttpException("Failed to add item to favorites", 400)
            );
        });
    });

    describe("removeFavorite", () => {
        it("should remove an item from favorites successfully", async () => {
            const mockFavorite = {
                id: "favorite-id",
                user_id: "test-user-id",
                item_id: "item-id",
                created_at: new Date(),
            };

            const mockRequest = {
                user: { id: "test-user-id" },
            };

            mockFavoriteService.removeFavorite.mockResolvedValue(mockFavorite);

            const result = await controller.removeFavorite(mockRequest as any, "item-id");

            const serialized = plainToInstance(FavoriteEntity, result, { 
                excludeExtraneousValues: false 
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("favorite-id");
            expect(favoriteService.removeFavorite).toHaveBeenCalledWith("test-user-id", "item-id");
        });

        it("should handle HttpException when removing favorite", async () => {
            const mockRequest = {
                user: { id: "test-user-id" },
            };

            const error = new HttpException("Item not found in favorites", 404);
            mockFavoriteService.removeFavorite.mockRejectedValue(error);

            await expect(controller.removeFavorite(mockRequest as any, "item-id")).rejects.toThrow(error);
        });

        it("should handle generic errors when removing", async () => {
            const mockRequest = {
                user: { id: "test-user-id" },
            };

            mockFavoriteService.removeFavorite.mockRejectedValue(new Error("Database error"));

            await expect(controller.removeFavorite(mockRequest as any, "item-id")).rejects.toThrow(
                new HttpException("Failed to remove item from favorites", 400)
            );
        });
    });

    describe("getFavorites", () => {
        it("should return user favorites with default parameters", async () => {
            const mockFavorites = [
                {
                    id: "favorite-1",
                    user_id: "test-user-id",
                    item_id: "item-1",
                    created_at: new Date(),
                    item: { id: "item-1", name: "Item 1" },
                },
                {
                    id: "favorite-2",
                    user_id: "test-user-id",
                    item_id: "item-2",
                    created_at: new Date(),
                    item: { id: "item-2", name: "Item 2" },
                },
            ];

            const mockRequest = {
                user: { id: "test-user-id" },
            };

            mockFavoriteService.getFavorites.mockResolvedValue(mockFavorites);

            const result = await controller.getFavorites(mockRequest as any, {});

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(FavoriteEntity);
            expect(result[0].id).toBe("favorite-1");
            expect(result[1].id).toBe("favorite-2");
            expect(favoriteService.getFavorites).toHaveBeenCalledWith("test-user-id", {});
        });

        it("should return user favorites with custom parameters", async () => {
            const mockFavorites = [
                {
                    id: "favorite-1",
                    user_id: "test-user-id",
                    item_id: "item-1",
                    created_at: new Date(),
                    item: { id: "item-1", name: "Item 1" },
                },
            ];

            const mockRequest = {
                user: { id: "test-user-id" },
            };

            const params = { limit: 10, offset: 5, order_by: "asc" as const };
            mockFavoriteService.getFavorites.mockResolvedValue(mockFavorites);

            const result = await controller.getFavorites(mockRequest as any, params);

            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(FavoriteEntity);
            expect(favoriteService.getFavorites).toHaveBeenCalledWith("test-user-id", params);
        });

        it("should return empty array when no favorites found", async () => {
            const mockRequest = {
                user: { id: "test-user-id" },
            };

            mockFavoriteService.getFavorites.mockResolvedValue([]);

            const result = await controller.getFavorites(mockRequest as any, {});

            expect(result).toEqual([]);
            expect(favoriteService.getFavorites).toHaveBeenCalledWith("test-user-id", {});
        });
    });
});
