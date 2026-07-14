import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/auth.guards';
import { CreatePlayerDto, PeopleListDto, UpdatePlayerDto } from './dto/people.dto';
import { PeopleService } from './people.service';

@ApiTags('players')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/players')
export class PlayersController {
  constructor(private readonly service: PeopleService) {}

  @Get()
  list(@Query() query: PeopleListDto) { return this.service.listPlayers(query); }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) { return this.service.getPlayer(id); }

  @Post()
  @ApiOperation({ summary: 'Cadastra a identidade do jogador; skills pertencem ao vínculo anual' })
  create(@Body() dto: CreatePlayerDto) { return this.service.createPlayer(dto); }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlayerDto) { return this.service.updatePlayer(id, dto); }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.removePlayer(id); }
}
