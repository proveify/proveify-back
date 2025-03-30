import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { APP_IS_PROD, APP_PORT, CORS_URL_LIST } from "@root/configs/envs.config";
import type { LogLevel } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap(): Promise<void> {
    const logLevel: LogLevel[] = ["error", "warn", "fatal", "log"];

    if (!APP_IS_PROD) {
        logLevel.push("debug", "verbose");
    }

    const app = await NestFactory.create(AppModule, { logger: logLevel });

    const config = new DocumentBuilder()
        .setTitle("proveify api")
        .setDescription("Documentación de la api proveify")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);

    app.enableCors({
        origin: APP_IS_PROD ? CORS_URL_LIST : "*",
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    await app.listen(APP_PORT);
}

void bootstrap();
