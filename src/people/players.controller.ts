import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePlayerDto, PeopleListDto, UpdatePlayerDto } from './dto/people.dto';
import { PeopleService } from './people.service';

@ApiTags('players')
@Controller('admin/players')
export class PlayersController {
  constructor(private readonly service: PeopleService) {}

  @Get()
  list(@Query() query: PeopleListDto) { return this.service.listPlayers(query); }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) { return this.service.getPlayer(id); }

  @Post()
  @ApiOperation({ summary: 'Cria pessoa, jogador e aliases em uma única transação' })
  create(@Body() dto: CreatePlayerDto) { return this.service.createPlayer(dto); }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlayerDto) { return this.service.updatePlayer(id, dto); }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.removePlayer(id); }
}
