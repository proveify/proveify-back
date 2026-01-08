import { Catch, ArgumentsHost, HttpStatus, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import * as Sentry from "@sentry/node";

@Catch()
export class SentryFilter extends BaseExceptionFilter {
    public catch(exception: unknown, host: ArgumentsHost): void {
        let status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
        }

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            Sentry.captureException(exception);
        }

        super.catch(exception, host);
    }
}
