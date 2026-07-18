import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/auth.guards';
import { AdminRankingService } from './admin-ranking.service';
import { ListAdminRankingDto, UpdateAdminRankingDto } from './dto/admin-ranking.dto';

@ApiTags('admin-ranking')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/ranking')
export class AdminRankingController {
  constructor(private readonly service: AdminRankingService) {}

  @Get('users')
  list(@Query() query: ListAdminRankingDto) {
    return this.service.list(query);
  }

  @Patch('users/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAdminRankingDto) {
    return this.service.update(id, body);
  }

  @Post('users/:id/release')
  release(@Param('id', ParseIntPipe) id: number) {
    return this.service.release(id);
  }

  @Post('reset-field')
  resetField() {
    return this.service.resetField();
  }
}
