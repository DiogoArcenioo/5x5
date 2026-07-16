import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, SessionAuthGuard } from '../auth/auth.guards';
import { RankedEventDto } from './dto/ranked-event.dto';
import { RankedService } from './ranked.service';

@ApiTags('ranked')
@Controller('ranked')
export class RankedController {
  constructor(private readonly service: RankedService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Ranking público de pontos das contas' })
  leaderboard(@Query('limit') limit?: number) {
    return this.service.leaderboard(limit);
  }

  @Get('today')
  @ApiBearerAuth()
  @UseGuards(SessionAuthGuard)
  today(@Req() request: AuthenticatedRequest) {
    return this.service.today(request.user.id);
  }

  @Post('start')
  @ApiBearerAuth()
  @UseGuards(SessionAuthGuard)
  start(@Req() request: AuthenticatedRequest) {
    return this.service.start(request.user.id);
  }

  @Post('runs/:id/events')
  @ApiBearerAuth()
  @UseGuards(SessionAuthGuard)
  addEvent(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() body: RankedEventDto) {
    return this.service.addEvent(request.user.id, id, body);
  }

  @Post('runs/:id/complete')
  @ApiBearerAuth()
  @UseGuards(SessionAuthGuard)
  complete(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.service.complete(request.user.id, id);
  }
}

