import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard, AuthenticatedRequest } from '../auth/auth.guards';
import { AdminUsersService } from './admin-users.service';
import { ListAdminUsersDto, ResetAdminUserPasswordDto, UpdateAdminUserDto } from './dto/admin-users.dto';

@ApiTags('admin-users')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  list(@Query() query: ListAdminUsersDto) {
    return this.service.list(query);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAdminUserDto, @Req() request: AuthenticatedRequest) {
    return this.service.update(id, body, request.user.id);
  }

  @Post(':id/password')
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body() body: ResetAdminUserPasswordDto) {
    return this.service.resetPassword(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.service.remove(id, request.user.id);
  }
}

