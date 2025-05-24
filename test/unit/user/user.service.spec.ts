import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../../../src/user/user.service";
import { PrismaService } from "../../../src/prisma/prisma.service";
import { UserNotFoundException } from "../../../src/user/exceptions/user-not-found.exception/user-not-found.exception";
import { plainToInstance } from "class-transformer";
import { UserEntity } from "../../../src/user/entities/user.entity";

const mockPrismaService = {
    users: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
};

describe("UserService", () => {
    let service: UserService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getUserProfile", () => {
        it("should return user profile when user exists", async () => {
            const mockUser = {
                id: "test-user-id",
                name: "Test User",
                email: "test@example.com",
                identification: "12345",
                identification_type: "CC",
                password: "hashed_password",
                refreshed_token: "token123",
                user_type: "CLIENT",
                Provider: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            jest.spyOn(service, "findUserOneById").mockResolvedValue(mockUser);

            // Act
            const result = await service.getUserProfile("test-user-id");
            
            // Simular la serialización que ocurriría en una petición real
            const serialized = plainToInstance(UserEntity, result, { 
                excludeExtraneousValues: false 
            });

            // Assert
            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-user-id");
            expect(serialized).not.toHaveProperty("password");
            expect(serialized).not.toHaveProperty("refreshed_token");
            expect(service.findUserOneById).toHaveBeenCalledWith({
                where: { id: "test-user-id" },
                include: { Provider: true }
            });
        });

        it("should throw exception when user does not exist", async () => {
            jest.spyOn(service, "findUserOneById").mockResolvedValue(null);

            await expect(service.getUserProfile("non-existent-id")).rejects.toThrow(
                UserNotFoundException,
            );
        });
    });
});
