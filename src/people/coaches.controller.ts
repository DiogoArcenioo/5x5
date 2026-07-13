import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/auth.guards';
import { CreateCoachDto, PeopleListDto, UpdateCoachDto } from './dto/people.dto';
import { PeopleService } from './people.service';

@ApiTags('coaches')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/coaches')
export class CoachesController {
  constructor(private readonly service: PeopleService) {}

  @Get()
  list(@Query() query: PeopleListDto) { return this.service.listCoaches(query); }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) { return this.service.getCoach(id); }

  @Post()
  @ApiOperation({ summary: 'Cria pessoa e coach em uma única transação' })
  create(@Body() dto: CreateCoachDto) { return this.service.createCoach(dto); }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCoachDto) { return this.service.updateCoach(id, dto); }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.removeCoach(id); }
}
