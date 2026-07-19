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
import { createDiagnosticCode, simulationContextOf } from './simulation-diagnostics';

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
    let exceptionPayload: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        exceptionPayload = exceptionResponse as Record<string, unknown>;
        message = exceptionPayload.message ?? message;
      } else message = exceptionResponse;
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
    }

    const attachedContext = simulationContextOf(exception);
    const runMatch = request.path.match(/^\/api\/(ranked|casual)\/runs\/([^/]+)/);
    const isCampaignFailure = Boolean(attachedContext || runMatch);
    const diagnosticCode = isCampaignFailure ? createDiagnosticCode() : undefined;
    if (isCampaignFailure) {
      const diagnostic = {
        diagnosticCode,
        campaignId: attachedContext?.campaignId ?? runMatch?.[2],
        action: attachedContext?.action ?? (request.path.split('/').slice(5).join('.') || 'request'),
        stage: attachedContext?.stage,
        round: attachedContext?.round,
        status,
        method: request.method,
        path: request.path,
        error: exception instanceof Error ? exception.message : String(exception),
      };
      const serialized = JSON.stringify(diagnostic);
      if (status >= 500) this.logger.error(serialized, exception instanceof Error ? exception.stack : undefined);
      else this.logger.warn(serialized);
    } else if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({
      ...exceptionPayload,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(diagnosticCode ? { diagnosticCode } : {}),
    });
  }
}
