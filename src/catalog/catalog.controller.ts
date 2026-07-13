import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  @Get('summary')
  summary() { return this.service.summary(); }

  @Get('teams')
  teams(@Query() query: CatalogQueryDto) { return this.service.teams(query); }

  @Get('teams/:slug')
  team(@Param('slug') slug: string) { return this.service.team(slug); }

  @Get('players')
  players(@Query() query: CatalogQueryDto) { return this.service.players(query); }

  @Get('players/:slug')
  @ApiOperation({ summary: 'Perfil público completo do jogador, sem campos de imagem' })
  player(@Param('slug') slug: string) { return this.service.player(slug); }

  @Get('seasons')
  seasons() { return this.service.seasons(); }

  @Get('tournaments')
  tournaments() { return this.service.tournaments(); }
}
