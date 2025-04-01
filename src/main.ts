import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import type { LogLevel } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap(): Promise<void> {
    const logLevel: LogLevel[] = ["error", "warn", "fatal", "log", "debug", "verbose"];
    const app = await NestFactory.create(AppModule, { logger: logLevel });

    const config = new DocumentBuilder()
        .setTitle("proveify api")
        .setDescription("Documentación de la api proveify")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    const configService = app.get(ConfigService);
    const appIsprod = configService.get<boolean>("app.isProd")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const corsUrlList = configService.get<string[]>("app.corsUrlList")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const port = configService.get<number>("app.port")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

    app.enableCors({
        origin: appIsprod ? corsUrlList : "*",
    });
    await app.listen(port);
}

void bootstrap();
