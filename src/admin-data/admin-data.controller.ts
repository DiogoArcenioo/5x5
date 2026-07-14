import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/auth.guards';
import { AdminDataService } from './admin-data.service';
import { CreateRecordDto, ListRecordsDto, RecordKeyDto, UpdateRecordDto } from './dto/admin-data.dto';

@ApiTags('admin-data')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/data')
export class AdminDataController {
  constructor(private readonly service: AdminDataService) {}

  @Get('resources')
  @ApiOperation({ summary: 'Lista recursos, campos e chaves disponíveis para o painel admin' })
  resources() {
    return this.service.describeResources();
  }

  @Get(':resource')
  @ApiParam({ name: 'resource', example: 'player-team-years' })
  @ApiOperation({ summary: 'Lista registros com paginação, busca, ordenação e filtros' })
  list(@Param('resource') resource: string, @Query() query: ListRecordsDto) {
    return this.service.list(resource, query);
  }

  @Post(':resource/find-one')
  @ApiOperation({ summary: 'Busca um registro pela chave simples ou composta' })
  findOne(@Param('resource') resource: string, @Body() body: RecordKeyDto) {
    return this.service.findOne(resource, body.key);
  }

  @Post(':resource')
  @ApiOperation({ summary: 'Cria um registro no recurso' })
  create(@Param('resource') resource: string, @Body() body: CreateRecordDto) {
    return this.service.create(resource, body.data);
  }

  @Patch(':resource')
  @ApiOperation({ summary: 'Atualiza um registro pela chave simples ou composta' })
  update(@Param('resource') resource: string, @Body() body: UpdateRecordDto) {
    return this.service.update(resource, body.key, body.data);
  }

  @Delete(':resource')
  @ApiOperation({ summary: 'Exclui um registro pela chave simples ou composta' })
  remove(@Param('resource') resource: string, @Body() body: RecordKeyDto) {
    return this.service.remove(resource, body.key);
  }
}
