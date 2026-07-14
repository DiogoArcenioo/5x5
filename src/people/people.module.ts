import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PeopleService } from './people.service';

@Module({ controllers: [PlayersController], providers: [PeopleService] })
export class PeopleModule {}
