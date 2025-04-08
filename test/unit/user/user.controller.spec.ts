import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../../../src/user/user.controller";
import { UserService } from "../../../src/user/user.service";
import { UserResponseInterceptor } from "../../../src/user/interceptors/user-response/user-response.interceptor";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { UserNotFoundException } from "../../../src/user/exceptions/user-not-found.exception/user-not-found.exception";
import { ExecutionContext } from "@nestjs/common";

// Mock para el JwtAuthGuard
const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: "test-user-id" };
        return true;
    }),
};

// Mock para el UserService
const mockUserService = {
    getUserProfile: jest.fn(),
};

describe("UserController", () => {
    let controller: UserController;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: UserResponseInterceptor,
                    useClass: UserResponseInterceptor,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
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
                created_at: new Date(),
                updated_at: new Date(),
            };

            const mockRequest = {
                user: { id: "test-user-id" },
            };

            mockUserService.getUserProfile.mockResolvedValue({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                identification: mockUser.identification,
                identification_type: mockUser.identification_type,
                created_at: mockUser.created_at,
                updated_at: mockUser.updated_at,
            });

            // Act
            const result = await controller.getUserProfile(mockRequest as any);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe("test-user-id");
            expect(result).not.toHaveProperty("password");
            expect(result).not.toHaveProperty("refreshed_token");
            expect(userService.getUserProfile).toHaveBeenCalledWith("test-user-id");
        });

        it("should throw exception when user does not exist", async () => {
            const mockRequest = {
                user: { id: "non-existent-id" },
            };

            mockUserService.getUserProfile.mockRejectedValue(
                new UserNotFoundException("non-existent-id"),
            );

            // Act & Assert
            await expect(controller.getUserProfile(mockRequest as any)).rejects.toThrow(
                UserNotFoundException,
            );
        });
    });
});
