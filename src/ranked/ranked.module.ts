import { Module } from '@nestjs/common';
import { RankedController } from './ranked.controller';
import { RankedService } from './ranked.service';
import { AdminRankingController } from './admin-ranking.controller';
import { AdminRankingService } from './admin-ranking.service';
import { RankedCycleService } from './ranked-cycle.service';

@Module({
  controllers: [RankedController, AdminRankingController],
  providers: [RankedService, AdminRankingService, RankedCycleService],
})
export class RankedModule {}
