import { Module } from '@nestjs/common';
import { RankedModule } from '../ranked/ranked.module';
import { CasualController } from './casual.controller';
import { CasualCleanupService } from './casual-cleanup.service';
import { CasualService } from './casual.service';

@Module({ imports: [RankedModule], controllers: [CasualController], providers: [CasualService, CasualCleanupService] })
export class CasualModule {}
