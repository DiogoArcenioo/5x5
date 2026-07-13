import { Module } from '@nestjs/common';
import { CoachesController } from './coaches.controller';
import { PlayersController } from './players.controller';
import { PeopleService } from './people.service';

@Module({
  controllers: [PlayersController, CoachesController],
  providers: [PeopleService],
})
export class PeopleModule {}
