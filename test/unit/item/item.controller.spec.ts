import { Test, TestingModule } from "@nestjs/testing";
import { ItemController } from "../../../src/item/item.controller";
import { ItemService } from "../../../src/item/item.service";
import { HttpException } from "@nestjs/common";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { OptionalJwtAuthGuard } from "../../../src/auth/guards/optional-jwt.guard";
import { OwnerSerializerInterceptor } from "../../../src/common/interceptors/owner-serializer.interceptor";
import { Reflector } from "@nestjs/core";
import { NestjsFormDataModule } from "nestjs-form-data";

const mockItemService = {
    prepareCreate: jest.fn(),
    createItem: jest.fn(),
    prepareUpdate: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    getProviderItems: jest.fn(),
    getItems: jest.fn(),
    getItemById: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    getFavorites: jest.fn(),
};

const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

const mockOptionalJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
};

describe("ItemController", () => {
    let controller: ItemController;
    let service: ItemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [NestjsFormDataModule.config({ isGlobal: true })],
            controllers: [ItemController],
            providers: [
                {
                    provide: ItemService,
                    useValue: mockItemService,
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
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(mockOptionalJwtAuthGuard)
            .overrideInterceptor(OwnerSerializerInterceptor)
            .useValue({
                intercept: jest.fn().mockImplementation((_, next) => next.handle()),
            })
            .compile();

        controller = module.get<ItemController>(ItemController);
        service = module.get<ItemService>(ItemService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("createItem", () => {
        it("should create an item successfully", async () => {
            const createDto = {
                name: "Test Item",
                description: "Test Description",
                type: "PRODUCT",
                price: 100,
            };

            const preparedData = {
                ...createDto,
                provider_id: "provider-123",
            };

            const createdItem = {
                id: "item-123",
                ...preparedData,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockItemService.prepareCreate.mockResolvedValue(preparedData);
            mockItemService.createItem.mockResolvedValue(createdItem);

            const result = await controller.createItem(createDto as any);

            expect(service.prepareCreate).toHaveBeenCalledWith(createDto);
            expect(service.createItem).toHaveBeenCalledWith(preparedData);
            expect(result).toEqual(createdItem);
        });
    });

    describe("updateItem", () => {
        it("should update an item successfully", async () => {
            const itemId = "item-123";
            const updateDto = {
                name: "Updated Item",
                description: "Updated Description",
                price: 200,
            };

            const preparedData = {
                ...updateDto,
            };

            const updatedItem = {
                id: itemId,
                ...preparedData,
                updated_at: new Date(),
            };

            mockItemService.prepareUpdate.mockResolvedValue(preparedData);
            mockItemService.updateItem.mockResolvedValue(updatedItem);

            const result = await controller.updateItem(updateDto as any, itemId);

            expect(service.prepareUpdate).toHaveBeenCalledWith(updateDto, itemId);
            expect(service.updateItem).toHaveBeenCalledWith(preparedData, itemId);
            expect(result).toEqual(updatedItem);
        });
    });

    describe("deleteItem", () => {
        it("should delete an item successfully", async () => {
            const itemId = "item-123";
            const deletedItem = {
                id: itemId,
                name: "Deleted Item",
            };

            mockItemService.deleteItem.mockResolvedValue(deletedItem);

            const result = await controller.deleteItem(itemId);

            expect(service.deleteItem).toHaveBeenCalledWith(itemId);
            expect(result).toEqual(deletedItem);
        });
    });

    describe("getProviderItems", () => {
        it("should return items for a specific provider", async () => {
            const providerId = "provider-123";
            const params = {
                limit: 10,
                offset: 0,
            };

            const mockItems = [
                { id: "item-1", name: "Item 1", provider_id: providerId },
                { id: "item-2", name: "Item 2", provider_id: providerId },
            ];

            mockItemService.getProviderItems.mockResolvedValue(mockItems);

            const result = await controller.getProviderItems(params, providerId);

            expect(service.getProviderItems).toHaveBeenCalledWith(providerId, params);
            expect(result).toEqual(mockItems);
        });
    });

    describe("getItems", () => {
        it("should return all items with default params", async () => {
            const params = {};
            const mockItems = [
                { id: "item-1", name: "Item 1" },
                { id: "item-2", name: "Item 2" },
            ];

            mockItemService.getItems.mockResolvedValue(mockItems);

            const result = await controller.getItems(params);

            expect(service.getItems).toHaveBeenCalledWith(params);
            expect(result).toEqual(mockItems);
        });

        it("should return items with filters", async () => {
            const params = {
                type: "PRODUCT",
                limit: 5,
                offset: 10,
            };

            const mockItems = [{ id: "item-1", name: "Item 1", type: "PRODUCT" }];

            mockItemService.getItems.mockResolvedValue(mockItems);

            const result = await controller.getItems(params);

            expect(service.getItems).toHaveBeenCalledWith(params);
            expect(result).toEqual(mockItems);
        });
    });

    describe("getItemById", () => {
        it("should return an item when it exists", async () => {
            const itemId = "item-123";
            const mockItem = {
                id: itemId,
                name: "Test Item",
                description: "Test Description",
            };

            mockItemService.getItemById.mockResolvedValue(mockItem);

            const result = await controller.getItemById(itemId);

            expect(service.getItemById).toHaveBeenCalledWith(itemId);
            expect(result).toEqual(mockItem);
        });

        it("should throw HttpException when item does not exist", async () => {
            const itemId = "non-existent-item";

            mockItemService.getItemById.mockResolvedValue(null);

            await expect(controller.getItemById(itemId)).rejects.toThrow(
                new HttpException("Item not found", 404),
            );
            expect(service.getItemById).toHaveBeenCalledWith(itemId);
        });
    });

    describe("addFavorite", () => {
        it("should add item to favorites successfully", async () => {
            const itemId = "item-123";
            const favorite = {
                id: "favorite-123",
                user_id: "user-123",
                item_id: itemId,
                created_at: new Date(),
            };

            mockItemService.addFavorite.mockResolvedValue(favorite);

            const result = await controller.addFavorite(itemId);

            expect(service.addFavorite).toHaveBeenCalledWith(itemId);
            expect(result).toEqual(favorite);
        });
    });

    describe("removeFavorite", () => {
        it("should remove item from favorites successfully", async () => {
            const itemId = "item-123";
            const favorite = {
                id: "favorite-123",
                user_id: "user-123",
                item_id: itemId,
                created_at: new Date(),
            };

            mockItemService.removeFavorite.mockResolvedValue(favorite);

            const result = await controller.removeFavorite(itemId);

            expect(service.removeFavorite).toHaveBeenCalledWith(itemId);
            expect(result).toEqual(favorite);
        });
    });

    describe("getFavorites", () => {
        it("should return user favorites", async () => {
            const params = {
                limit: 10,
                offset: 0,
            };

            const mockFavorites = [
                { id: "favorite-1", user_id: "user-123", item_id: "item-1" },
                { id: "favorite-2", user_id: "user-123", item_id: "item-2" },
            ];

            mockItemService.getFavorites.mockResolvedValue(mockFavorites);

            const result = await controller.getFavorites(params);

            expect(service.getFavorites).toHaveBeenCalledWith(params);
            expect(result).toEqual(mockFavorites);
        });
    });
});
