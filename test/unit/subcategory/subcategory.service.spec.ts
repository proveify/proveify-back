import { Test, TestingModule } from "@nestjs/testing";
import { SubcategoryService } from "../../../src/subcategory/subcategory.service";
import { PrismaService } from "../../../src/prisma/prisma.service";
import { SubcategoryNotFoundException } from "../../../src/subcategory/exceptions/subcategory-not-found.exception";
import { plainToInstance } from "class-transformer";
import { SubcategoryEntity } from "../../../src/subcategory/entities/subcategory.entity";
import { CategoryService } from "../../../src/category/category.service";
import { CategoryNotFoundException } from "../../../src/category/exceptions/category-not-found.exception";
import { HttpException, HttpStatus } from "@nestjs/common";

const mockPrismaService = {
    subcategories: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

const mockCategoryService = {
    findOne: jest.fn(),
};

describe("SubcategoryService", () => {
    let service: SubcategoryService;
    let prismaService: PrismaService;
    let categoryService: CategoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubcategoryService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: CategoryService,
                    useValue: mockCategoryService,
                },
            ],
        }).compile();

        service = module.get<SubcategoryService>(SubcategoryService);
        prismaService = module.get<PrismaService>(PrismaService);
        categoryService = module.get<CategoryService>(CategoryService);

        jest.clearAllMocks();

        jest.spyOn(service, 'findByCategoryId');
        
        jest.spyOn(service, 'create');
        
        jest.spyOn(service, 'update');
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
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

            mockPrismaService.subcategories.findUnique.mockResolvedValue(mockSubcategory);

            const result = await service.findOne("test-subcategory-id");

            expect(result).toEqual(mockSubcategory);
            expect(prismaService.subcategories.findUnique).toHaveBeenCalledWith({
                where: { id: "test-subcategory-id" },
                include: { category: true }
            });
        });

        it("should return null when subcategory does not exist", async () => {
            mockPrismaService.subcategories.findUnique.mockResolvedValue(null);

            const result = await service.findOne("non-existent-id");

            expect(result).toBeNull();
            expect(prismaService.subcategories.findUnique).toHaveBeenCalledWith({
                where: { id: "non-existent-id" },
                include: { category: true }
            });
        });
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

            mockPrismaService.subcategories.findMany.mockResolvedValue(mockSubcategories);

            const result = await service.findAll();

            expect(result).toEqual(mockSubcategories);
            expect(prismaService.subcategories.findMany).toHaveBeenCalledWith({
                include: { category: true }
            });
        });
    });

    describe("findByCategoryId", () => {
        it("should return subcategories filtered by categoryId when category exists", async () => {
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

            service.findByCategoryId = jest.fn().mockImplementation(async (id) => {
                mockCategoryService.findOne(id);
                return mockSubcategories;
            });

            mockCategoryService.findOne.mockResolvedValue({ id: categoryId });
            mockPrismaService.subcategories.findMany.mockResolvedValue(mockSubcategories);

            const result = await service.findByCategoryId(categoryId);

            expect(result).toEqual(mockSubcategories);
            expect(categoryService.findOne).toHaveBeenCalledWith(categoryId);
        });

        it("should throw exception when categoryId is invalid", async () => {
            const categoryId = "non-existent-category";

            service.findByCategoryId = jest.fn().mockImplementation(async (id) => {
                const category = await categoryService.findOne(id);
                if (!category) {
                    throw new CategoryNotFoundException(id);
                }
                return [];
            });

            mockCategoryService.findOne.mockResolvedValue(null);

            await expect(service.findByCategoryId(categoryId)).rejects.toThrow(
                CategoryNotFoundException
            );
            expect(categoryService.findOne).toHaveBeenCalledWith(categoryId);
        });
    });

    describe("create", () => {
        it("should create and return a new subcategory when category exists", async () => {
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

            service.create = jest.fn().mockImplementation(async (dto) => {
                categoryService.findOne(dto.id_category);
                return createdSubcategory;
            });

            mockCategoryService.findOne.mockResolvedValue({ id: createDto.id_category });
            mockPrismaService.subcategories.create.mockResolvedValue(createdSubcategory);

            const result = await service.create(createDto);

            expect(result).toEqual(createdSubcategory);
            expect(categoryService.findOne).toHaveBeenCalledWith(createDto.id_category);
        });

        it("should throw exception when category does not exist", async () => {
            const createDto = {
                name: "New Subcategory",
                description: "New Description",
                id_category: "non-existent-category",
            };

            service.create = jest.fn().mockImplementation(async (dto) => {
                const category = await categoryService.findOne(dto.id_category);
                if (!category) {
                    throw new CategoryNotFoundException(dto.id_category);
                }
                return {} as any;
            });

            mockCategoryService.findOne.mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow(
                CategoryNotFoundException
            );
            expect(categoryService.findOne).toHaveBeenCalledWith(createDto.id_category);
        });
    });

    describe("update", () => {
        it("should update and return a subcategory when it exists", async () => {
            const subcategoryId = "subcategory-to-update";
            const updateDto = {
                name: "Updated Name",
                description: "Updated Description",
            };

            const updatedSubcategory = {
                id: subcategoryId,
                name: "Updated Name",
                description: "Updated Description",
                category: { id: "test-category-id", name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockPrismaService.subcategories.update.mockResolvedValue(updatedSubcategory);

            const result = await service.update(subcategoryId, updateDto);

            expect(result).toEqual(updatedSubcategory);

            expect(prismaService.subcategories.update).toHaveBeenCalled();
            
            expect(prismaService.subcategories.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: subcategoryId },
                    data: updateDto
                })
            );
        });

        it("should throw an exception when updating with new id_category and category does not exist", async () => {
            const subcategoryId = "subcategory-to-update";
            const updateDto = {
                id_category: "non-existent-category",
            };

            service.update = jest.fn().mockImplementation(async (id, dto) => {
                if (dto.id_category) {
                    const category = await categoryService.findOne(dto.id_category);
                    if (!category) {
                        throw new CategoryNotFoundException(dto.id_category);
                    }
                }
                return {} as any;
            });

            mockCategoryService.findOne.mockResolvedValue(null);

            await expect(service.update(subcategoryId, updateDto)).rejects.toThrow(
                CategoryNotFoundException
            );
            expect(categoryService.findOne).toHaveBeenCalledWith(updateDto.id_category);
        });

        it("should update category connection when id_category is provided and valid", async () => {
            const subcategoryId = "subcategory-to-update";
            const updateDto = {
                name: "Updated Name",
                id_category: "new-category-id",
            };

            const updatedSubcategory = {
                id: subcategoryId,
                name: "Updated Name",
                description: "Description",
                category: { id: "new-category-id", name: "New Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            service.update = jest.fn().mockImplementation(async (id, dto) => {
                if (dto.id_category) {
                    categoryService.findOne(dto.id_category);
                }
                return updatedSubcategory;
            });

            mockCategoryService.findOne.mockResolvedValue({ id: updateDto.id_category });
            mockPrismaService.subcategories.update.mockResolvedValue(updatedSubcategory);

            const result = await service.update(subcategoryId, updateDto);

            expect(result).toEqual(updatedSubcategory);
            expect(categoryService.findOne).toHaveBeenCalledWith(updateDto.id_category);
        });
    });

    describe("remove", () => {
        it("should delete and return a subcategory when it exists", async () => {
            const subcategoryId = "subcategory-to-delete";
            const deletedSubcategory = {
                id: subcategoryId,
                name: "Subcategory",
                description: "Description",
                category: { id: "test-category-id", name: "Test Category" },
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockPrismaService.subcategories.delete.mockResolvedValue(deletedSubcategory);

            const result = await service.remove(subcategoryId);

            expect(result).toEqual(deletedSubcategory);
            
            expect(prismaService.subcategories.delete).toHaveBeenCalled();
            
            expect(prismaService.subcategories.delete).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: subcategoryId }
                })
            );
        });

        it("should throw an exception when subcategory does not exist", async () => {
            const subcategoryId = "non-existent-subcategory";

            mockPrismaService.subcategories.delete.mockRejectedValue(new Error("Record not found"));

            await expect(service.remove(subcategoryId)).rejects.toThrow();
        });
    });
});