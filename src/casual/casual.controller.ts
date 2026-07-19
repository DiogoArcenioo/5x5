import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CasualDraftLayoutDto, CasualDraftPickDto, CasualRevisionBodyDto, CasualStrategyDto } from './dto/casual-campaign.dto';
import { CasualService } from './casual.service';

@ApiTags('casual')
@Controller('casual')
export class CasualController {
  constructor(private readonly service:CasualService){}

  @Post('start') @Throttle({default:{limit:12,ttl:60_000}}) @ApiOperation({summary:'Cria uma campanha normal autoritativa e temporária'})
  start(){return this.service.start();}

  @Get('runs/:id')
  get(@Param('id',ParseUUIDPipe)id:string){return this.service.get(id);}

  @Post('runs/:id/strategy')
  strategy(@Param('id',ParseUUIDPipe)id:string,@Body()body:CasualStrategyDto){return this.service.strategy(id,body.revision,body.roles);}
  @Post('runs/:id/draft/reroll')
  reroll(@Param('id',ParseUUIDPipe)id:string,@Body()body:CasualRevisionBodyDto){return this.service.reroll(id,body.revision);}
  @Post('runs/:id/draft/pick')
  pick(@Param('id',ParseUUIDPipe)id:string,@Body()body:CasualDraftPickDto){return this.service.pick(id,body.revision,body.slug,body.slot);}
  @Post('runs/:id/draft/layout')
  layout(@Param('id',ParseUUIDPipe)id:string,@Body()body:CasualDraftLayoutDto){return this.service.layout(id,body.revision,body.slugs,body.roles);}
  @Post('runs/:id/finalize')
  finalize(@Param('id',ParseUUIDPipe)id:string,@Body()body:CasualRevisionBodyDto){return this.service.finalize(id,body.revision);}
  @Post('runs/:id/advance')
  advance(@Param('id',ParseUUIDPipe)id:string,@Body()body:CasualRevisionBodyDto){return this.service.advance(id,body.revision);}
}
