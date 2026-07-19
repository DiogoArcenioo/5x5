import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, SessionAuthGuard } from '../auth/auth.guards';
import { RankedAdvanceDto, RankedDraftLayoutDto, RankedDraftPickDto, RankedRevisionDto, RankedStrategyDto } from './dto/ranked-campaign.dto';
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

  @Post('runs/:id/strategy') @ApiBearerAuth() @UseGuards(SessionAuthGuard)
  strategy(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() body: RankedStrategyDto) { return this.service.strategy(request.user.id, id, body.revision, body.roles); }

  @Post('runs/:id/draft/reroll') @ApiBearerAuth() @UseGuards(SessionAuthGuard)
  reroll(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() body: RankedRevisionDto) { return this.service.reroll(request.user.id, id, body.revision); }

  @Post('runs/:id/draft/pick') @ApiBearerAuth() @UseGuards(SessionAuthGuard)
  pick(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() body: RankedDraftPickDto) { return this.service.pick(request.user.id, id, body.revision, body.slug, body.slot); }

  @Post('runs/:id/draft/layout') @ApiBearerAuth() @UseGuards(SessionAuthGuard)
  layout(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() body: RankedDraftLayoutDto) { return this.service.layout(request.user.id, id, body.revision, body.slugs, body.roles); }

  @Post('runs/:id/finalize') @ApiBearerAuth() @UseGuards(SessionAuthGuard)
  finalize(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() body: RankedRevisionDto) { return this.service.finalize(request.user.id, id, body.revision); }

  @Post('runs/:id/advance') @ApiBearerAuth() @UseGuards(SessionAuthGuard)
  advance(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() body: RankedAdvanceDto) { return this.service.advance(request.user.id, id, body.revision); }

  @Post('runs/:id/complete')
  @ApiBearerAuth()
  @UseGuards(SessionAuthGuard)
  complete(@Req() request: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.service.complete(request.user.id, id);
  }
}
