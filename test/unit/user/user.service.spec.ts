import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../../../src/user/user.service";
import { PrismaService } from "../../../src/prisma/prisma.service";
import { UserStoreService } from "../../../src/user/user-store.service";
import { UserNotFoundException } from "../../../src/user/exceptions/user-not-found.exception/user-not-found.exception";

const mockPrismaService = {
    users: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
};

const mockUserStoreService = {
    getUsers: jest.fn(),
    setUser: jest.fn(),
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
                {
                    provide: UserStoreService,
                    useValue: mockUserStoreService,
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
                created_at: new Date(),
                updated_at: new Date(),
            };

            jest.spyOn(service, "findUserOneById").mockResolvedValue(mockUser);

            const result = await service.getUserProfile("test-user-id");

            expect(result).toBeDefined();
            expect(result.id).toBe("test-user-id");
            expect(result).not.toHaveProperty("password");
            expect(result).not.toHaveProperty("refreshed_token");
            expect(service.findUserOneById).toHaveBeenCalledWith("test-user-id");
        });

        it("should throw exception when user does not exist", async () => {
            jest.spyOn(service, "findUserOneById").mockResolvedValue(null);

            await expect(service.getUserProfile("non-existent-id")).rejects.toThrow(
                UserNotFoundException,
            );
        });
    });
});
