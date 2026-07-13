import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Request, Response } from 'express';

type PostgresError = Error & { code?: string; detail?: string };

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = 'Erro interno do servidor.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof QueryFailedError) {
      const databaseError = exception.driverError as PostgresError;
      const mappings: Record<string, [number, string]> = {
        '23505': [HttpStatus.CONFLICT, 'Já existe um registro com estes dados.'],
        '23503': [HttpStatus.CONFLICT, 'A operação viola um vínculo existente ou referencia inexistente.'],
        '23514': [HttpStatus.BAD_REQUEST, 'Um ou mais valores violam as regras do banco.'],
        '23502': [HttpStatus.BAD_REQUEST, 'Um campo obrigatório não foi informado.'],
        '22P02': [HttpStatus.BAD_REQUEST, 'Um identificador ou valor possui formato inválido.'],
        '22001': [HttpStatus.BAD_REQUEST, 'Um texto excede o tamanho máximo permitido.'],
        '22003': [HttpStatus.BAD_REQUEST, 'Um valor numérico está fora do intervalo permitido.'],
        '22007': [HttpStatus.BAD_REQUEST, 'Uma data ou horário possui formato inválido.'],
      };
      const mapped = databaseError.code ? mappings[databaseError.code] : undefined;
      if (mapped) [status, message] = mapped;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
