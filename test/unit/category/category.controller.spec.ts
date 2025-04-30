import { Test, TestingModule } from "@nestjs/testing";
import { CategoryController } from "../../../src/category/category.controller";
import { CategoryService } from "../../../src/category/category.service";
import { ClassSerializerInterceptor, HttpException, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { Reflector } from "@nestjs/core";
import { CategoryEntity } from "../../../src/category/entities/category.entity";
import { plainToInstance } from "class-transformer";
import { CategoryNotFoundException } from "../../../src/category/exceptions/category-not-found.exception";

// Mock para el JwtAuthGuard
const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

// Mock para el CategoryService
const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe("CategoryController", () => {
    let controller: CategoryController;
    let categoryService: CategoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoryController],
            providers: [
                {
                    provide: CategoryService,
                    useValue: mockCategoryService,
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

        controller = module.get<CategoryController>(CategoryController);
        categoryService = module.get<CategoryService>(CategoryService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("findAll", () => {
        it("should return an array of categories", async () => {
            const mockCategories = [
                {
                    id: "category-1",
                    name: "Category 1",
                    description: "Description 1",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: "category-2",
                    name: "Category 2",
                    description: "Description 2",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            mockCategoryService.findAll.mockResolvedValue(mockCategories);

            const result = await controller.findAll();

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe("category-1");
            expect(result[1].id).toBe("category-2");
            expect(categoryService.findAll).toHaveBeenCalled();
        });
    });

    describe("findOne", () => {
        it("should return a category when it exists", async () => {
            const mockCategory = {
                id: "test-category-id",
                name: "Test Category",
                description: "Test Description",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockCategoryService.findOne.mockResolvedValue(mockCategory);

            const result = await controller.findOne("test-category-id");
            
            // Simular la serialización 
            const serialized = plainToInstance(CategoryEntity, result, { 
                excludeExtraneousValues: false 
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-category-id");
            expect(categoryService.findOne).toHaveBeenCalledWith("test-category-id");
        });

        it("should throw exception when category does not exist", async () => {
            mockCategoryService.findOne.mockResolvedValue(null);

            await expect(controller.findOne("non-existent-id")).rejects.toThrow(
                new HttpException("Category not found", HttpStatus.NOT_FOUND)
            );
        });
    });

    describe("create", () => {
        it("should create and return a new category", async () => {
            const createDto = {
                name: "New Category",
                description: "New Description",
            };

            const createdCategory = {
                id: "new-category-id",
                ...createDto,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockCategoryService.create.mockResolvedValue(createdCategory);

            const result = await controller.create(createDto);
            
            const serialized = plainToInstance(CategoryEntity, result, { 
                excludeExtraneousValues: false 
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("new-category-id");
            expect(serialized.name).toBe(createDto.name);
            expect(categoryService.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe("update", () => {
        it("should update and return a category when it exists", async () => {
            const updateDto = {
                name: "Updated Category",
                description: "Updated Description",
            };

            const updatedCategory = {
                id: "test-category-id",
                ...updateDto,
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockCategoryService.update.mockResolvedValue(updatedCategory);

            const result = await controller.update("test-category-id", updateDto);
            
            // Simular la serialización
            const serialized = plainToInstance(CategoryEntity, result, { 
                excludeExtraneousValues: false 
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-category-id");
            expect(serialized.name).toBe(updateDto.name);
            expect(categoryService.update).toHaveBeenCalledWith("test-category-id", updateDto);
        });

        it("should throw exception when category does not exist", async () => {
            const updateDto = { name: "Updated" };

            mockCategoryService.update.mockRejectedValue(new HttpException("Category not found", HttpStatus.NOT_FOUND));

            await expect(controller.update("non-existent-id", updateDto)).rejects.toThrow(HttpException);
        });
    });

    describe("remove", () => {
        it("should delete and return a category when it exists", async () => {
            const deletedCategory = {
                id: "category-to-delete",
                name: "Category",
                description: "Description",
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockCategoryService.remove.mockResolvedValue(deletedCategory);

            const result = await controller.remove("category-to-delete");
            
            // Simular la serialización
            const serialized = plainToInstance(CategoryEntity, result, { 
                excludeExtraneousValues: false 
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("category-to-delete");
            expect(categoryService.remove).toHaveBeenCalledWith("category-to-delete");
        });

        it("should throw exception when category does not exist", async () => {
            mockCategoryService.remove.mockRejectedValue(new HttpException("Category not found", HttpStatus.NOT_FOUND));

            await expect(controller.remove("non-existent-id")).rejects.toThrow(HttpException);
        });
    });
});