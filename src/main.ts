import "source-map-support/register";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import type { LogLevel } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Sentry from "@sentry/node";
import { SentryFilter } from "@app/common/sentry-exception.filter";

async function bootstrap(): Promise<void> {
    const logLevel: LogLevel[] = ["error", "warn", "fatal", "log", "debug", "verbose"];
    const app = await NestFactory.create(AppModule, { logger: logLevel });

    const configService = app.get(ConfigService);
    const environment = configService.get<string>("environments.environment")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const isProduction = configService.get<boolean>("environments.isProd")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const isTesting = configService.get<boolean>("environments.isTesting")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const corsUrlList = configService.get<string[]>("app.corsUrlList")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const port = configService.get<number>("app.port")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

    if (isProduction || isTesting) {
        const glitchtipDsn = configService.get<string>("app.glitchtipDsn");

        if (glitchtipDsn) {
            Sentry.init({
                dsn: glitchtipDsn,
                environment,
                integrations: [
                    Sentry.rewriteFramesIntegration({
                        iteratee: (frame) => {
                            if (frame.filename) {
                                frame.filename = frame.filename
                                    .replace(/^.*\/var\/app\//, "")
                                    .replace(/^src\//, "source/");
                            }
                            return frame;
                        },
                    }),
                ],
            });

            const { httpAdapter } = app.get(HttpAdapterHost);
            app.useGlobalFilters(new SentryFilter(httpAdapter));
        }
    }

    const config = new DocumentBuilder()
        .setTitle("proveify api")
        .setDescription("Documentación de la api proveify")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document, {
        swaggerOptions: {
            docExpansion: "none",
            filter: true,
            showRequestDuration: true,
            showCommonExtensions: true,
            displayOperationId: true,
            displayRequestDuration: true,
            deepLinking: true,
            defaultModelsExpandDepth: 1,
            defaultModelRendering: "example",
            tryItOutEnabled: true,
            persistAuthorization: true,
            tagsSorter: "alpha",
            operationsSorter: "alpha",
            syntaxHighlight: {
                activate: true,
                theme: "agate",
            },
        },
        customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui { 
            background-color: #fafafa; 
        }
        .swagger-ui .info .title { 
            color: #3b4151; 
            font-size: 36px; 
        }
        .swagger-ui .scheme-container { 
            background: #fff; 
            box-shadow: 0 1px 2px 0 rgba(0,0,0,.15); 
        }
        `,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.enableCors({
        origin: isProduction ? corsUrlList : "*",
    });

    await app.listen(port);
}

void bootstrap();
