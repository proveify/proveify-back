import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [UserModule],
    exports: [UserService],
})
export class UserModule {}
