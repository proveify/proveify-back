import { Module } from "@nestjs/common";
import { RegisterService } from "./register.service";
import { RegisterController } from "./register.controller";
import { UserModule } from "@app/user/user.module";

@Module({
    providers: [RegisterService],
    controllers: [RegisterController],
    imports: [UserModule],
})
export class RegisterModule {}
