import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Verifica a API e a conexão com PostgreSQL' })
  async check(): Promise<Record<string, unknown>> {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok' };
  }
}
