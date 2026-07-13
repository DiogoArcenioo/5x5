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
    const result = await this.dataSource.query(
      'SELECT current_database() AS database, current_user AS "user", now() AS "databaseTime"',
    ) as Array<Record<string, unknown>>;
    return { status: 'ok', database: result[0] };
  }
}
