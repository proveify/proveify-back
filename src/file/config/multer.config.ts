import { Injectable } from "@nestjs/common";

import type { MulterModuleOptions, MulterOptionsFactory } from "@nestjs/platform-express";

@Injectable()
export class MulterCofigService implements MulterOptionsFactory {
    public createMulterOptions(): MulterModuleOptions {
        return {
            dest: "./storage",
        };
    }
}
