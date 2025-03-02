import { Injectable } from "@nestjs/common";

import type { MulterModuleOptions, MulterOptionsFactory } from "@nestjs/platform-express";

@Injectable()
export class MulterConfigProvider implements MulterOptionsFactory {
    public createMulterOptions(): MulterModuleOptions {
        return {
            dest: "./storage",
        };
    }
}
