import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { APP_IS_PROD, APP_PORT } from "../config/envs";
import type { LogLevel } from "@nestjs/common";
import { ValidationPipe, VersioningType } from "@nestjs/common";

async function bootstrap(): Promise<void> {
    const logLevel: LogLevel[] = ["error", "warn", "fatal", "log"];

    if (!APP_IS_PROD) {
        logLevel.push("debug", "verbose");
    }

    const app = await NestFactory.create(AppModule, { logger: logLevel });
    app.enableVersioning({ type: VersioningType.URI });

    const config = new DocumentBuilder()
        .setTitle("proveeify api")
        .setDescription("Documentacion de la api proveeify")
        .setVersion("1.0")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);

    app.useGlobalPipes(new ValidationPipe());

    await app.listen(APP_PORT);
}

void bootstrap();
