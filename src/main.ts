import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { APP_IS_PROD, APP_PORT } from "@root/configs/envs.config";
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

    /**
     * TODO: hay que implementar mejor los cors para distintos ambientes
     * actualmente se deja para cualquier origen pero en producción solamente
     * debe permitir la URL del frontend, por otro lado las reglas definidas en * typescript estan poniendo dificultades para
     * manejar constates generales de la aplicación
     * revisar: @typescript-eslint/no-unsafe-assignment
     */
    app.enableCors({
        origin: "*",
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
