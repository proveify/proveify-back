import { Test, TestingModule } from "@nestjs/testing";
import { SubcategoryController } from "../../../src/subcategory/subcategory.controller";
import { SubcategoryService } from "../../../src/subcategory/subcategory.service";
import { ClassSerializerInterceptor, HttpException, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { Reflector } from "@nestjs/core";
import { SubcategoryEntity } from "../../../src/subcategory/entities/subcategory.entity";
import { plainToInstance } from "class-transformer";
import { SubcategoryNotFoundException } from "../../../src/subcategory/exceptions/subcategory-not-found.exception";
import { CategoryNotFoundException } from "../../../src/category/exceptions/category-not-found.exception";

const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

const mockSubcategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByCategoryId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe("SubcategoryController", () => {
    let controller: SubcategoryController;
    let subcategoryService: SubcategoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SubcategoryController],
            providers: [
                {
                    provide: SubcategoryService,
                    useValue: mockSubcategoryService,
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

        controller = module.get<SubcategoryController>(SubcategoryController);
        subcategoryService = module.get<SubcategoryService>(SubcategoryService);

        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("findAll", () => {
        it("should return all subcategories", async () => {
            const mockSubcategories = [
                {
                    id: "subcategory-1",
                    name: "Subcategory 1",
                    description: "Description 1",
                    category: { id: "category-1", name: "Category 1" },
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: "subcategory-2",
                    name: "Subcategory 2",
                    description: "Description 2",
                    category: { id: "category-2", name: "Category 2" },
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            mockSubcategoryService.findAll.mockResolvedValue(mockSubcategories);

            const result = await controller.findAll();

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe("subcategory-1");
            expect(result[1].id).toBe("subcategory-2");
            // Usando encadenamiento opcional para evitar errores
            expect(result[0].category?.id).toBe("category-1");
            expect(subcategoryService.findAll).toHaveBeenCalled();
        });
    });

    describe("findByCategoryId", () => {
        it("should return subcategories filtered by categoryId", async () => {
            const categoryId = "test-category-id";
            const mockSubcategories = [
                {
                    id: "subcategory-1",
                    name: "Subcategory 1",
                    description: "Description 1",
                    category: { id: categoryId, name: "Test Category" },
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            mockSubcategoryService.findByCategoryId.mockResolvedValue(mockSubcategories);

            const result = await controller.findByCategoryId(categoryId);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("subcategory-1");
            expect(result[0].category).toBeDefined();
            expect(result[0].category?.id).toBe(categoryId);
            expect(subcategoryService.findByCategoryId).toHaveBeenCalledWith(categoryId);
        });

        it("should throw exception when categoryId is invalid", async () => {
            const categoryId = "non-existent-category";

            mockSubcategoryService.findByCategoryId.mockRejectedValue(
                new CategoryNotFoundException(categoryId),
            );

            await expect(controller.findByCategoryId(categoryId)).rejects.toThrow(
                CategoryNotFoundException,
            );
        });
    });

    describe("findOne", () => {
        it("should return a subcategory when it exists", async () => {
            const mockSubcategory = {
                id: "test-subcategory-id",
                name: "Test Subcategory",
                description: "Test Description",
                category: { id: "test-category-id", name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockSubcategoryService.findOne.mockResolvedValue(mockSubcategory);

            const result = await controller.findOne("test-subcategory-id");

            const serialized = plainToInstance(SubcategoryEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-subcategory-id");

            expect(serialized.category).toBeDefined();
            expect(serialized.category?.id).toBe("test-category-id");
            expect(subcategoryService.findOne).toHaveBeenCalledWith("test-subcategory-id");
        });

        it("should throw exception when subcategory does not exist", async () => {
            mockSubcategoryService.findOne.mockResolvedValue(null);

            await expect(controller.findOne("non-existent-id")).rejects.toThrow(
                new HttpException("Subcategory not found", HttpStatus.NOT_FOUND),
            );
        });
    });

    describe("create", () => {
        it("should create and return a new subcategory", async () => {
            const createDto = {
                name: "New Subcategory",
                description: "New Description",
                id_category: "test-category-id",
            };

            const createdSubcategory = {
                id: "new-subcategory-id",
                name: createDto.name,
                description: createDto.description,
                category: { id: createDto.id_category, name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockSubcategoryService.create.mockResolvedValue(createdSubcategory);

            const result = await controller.create(createDto);

            const serialized = plainToInstance(SubcategoryEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("new-subcategory-id");
            expect(serialized.name).toBe(createDto.name);
            expect(serialized.category).toBeDefined();
            expect(serialized.category?.id).toBe(createDto.id_category);
            expect(subcategoryService.create).toHaveBeenCalledWith(createDto);
        });

        it("should throw exception when category does not exist", async () => {
            const createDto = {
                name: "New Subcategory",
                description: "New Description",
                id_category: "non-existent-category",
            };

            mockSubcategoryService.create.mockRejectedValue(
                new CategoryNotFoundException(createDto.id_category),
            );

            await expect(controller.create(createDto)).rejects.toThrow(CategoryNotFoundException);
        });
    });

    describe("update", () => {
        it("should update and return a subcategory when it exists", async () => {
            const updateDto = {
                name: "Updated Subcategory",
                description: "Updated Description",
            };

            const updatedSubcategory = {
                id: "test-subcategory-id",
                name: "Updated Subcategory",
                description: "Updated Description",
                category: { id: "test-category-id", name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockSubcategoryService.update.mockResolvedValue(updatedSubcategory);

            const result = await controller.update("test-subcategory-id", updateDto);

            const serialized = plainToInstance(SubcategoryEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-subcategory-id");
            expect(serialized.name).toBe(updateDto.name);
            expect(serialized.category).toBeDefined();
            expect(serialized.category?.id).toBe("test-category-id");
            expect(subcategoryService.update).toHaveBeenCalledWith(
                "test-subcategory-id",
                updateDto,
            );
        });

        it("should throw exception when subcategory does not exist", async () => {
            const updateDto = { name: "Updated" };

            mockSubcategoryService.update.mockRejectedValue(
                new HttpException("Subcategory not found", HttpStatus.NOT_FOUND),
            );

            await expect(controller.update("non-existent-id", updateDto)).rejects.toThrow(
                HttpException,
            );
        });

        it("should throw exception when updating id_category and category does not exist", async () => {
            const updateDto = {
                id_category: "non-existent-category",
            };

            mockSubcategoryService.update.mockRejectedValue(
                new CategoryNotFoundException(updateDto.id_category),
            );

            await expect(controller.update("test-subcategory-id", updateDto)).rejects.toThrow(
                CategoryNotFoundException,
            );
        });
    });

    describe("remove", () => {
        it("should delete and return a subcategory when it exists", async () => {
            const deletedSubcategory = {
                id: "subcategory-to-delete",
                name: "Subcategory",
                description: "Description",
                category: { id: "test-category-id", name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockSubcategoryService.remove.mockResolvedValue(deletedSubcategory);

            const result = await controller.remove("subcategory-to-delete");

            const serialized = plainToInstance(SubcategoryEntity, result, {
                excludeExtraneousValues: false,
            });

            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("subcategory-to-delete");
            expect(subcategoryService.remove).toHaveBeenCalledWith("subcategory-to-delete");
        });

        it("should throw exception when subcategory does not exist", async () => {
            mockSubcategoryService.remove.mockRejectedValue(
                new HttpException("Subcategory not found", HttpStatus.NOT_FOUND),
            );

            await expect(controller.remove("non-existent-id")).rejects.toThrow(HttpException);
        });
    });
});
