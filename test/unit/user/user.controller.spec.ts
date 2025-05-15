import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../../../src/user/user.controller";
import { UserService } from "../../../src/user/user.service";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { JwtAuthGuard } from "../../../src/auth/guards/jwt.guard";
import { UserNotFoundException } from "../../../src/user/exceptions/user-not-found.exception/user-not-found.exception";
import { Reflector } from "@nestjs/core";
import { UserEntity } from "../../../src/user/entities/user.entity";
import { plainToInstance } from "class-transformer";

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

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("getUserProfile", () => {
        it("should return user profile when user exists", async () => {
            // Creamos una instancia real de UserEntity
            const userEntity = new UserEntity({
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
            });

            const mockRequest = {
                user: { id: "test-user-id" },
            };

            mockUserService.getUserProfile.mockResolvedValue(userEntity);

            // Act
            const result = await controller.getUserProfile(mockRequest as any);
            
            // Simular la serialización que ocurriría en una petición real
            const serialized = plainToInstance(UserEntity, result, { 
                excludeExtraneousValues: false 
            });

            // Assert
            expect(serialized).toBeDefined();
            expect(serialized.id).toBe("test-user-id");
            expect(serialized).not.toHaveProperty("password");
            expect(serialized).not.toHaveProperty("refreshed_token");
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
