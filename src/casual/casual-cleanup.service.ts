import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { DataSource } from 'typeorm';

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class CasualCleanupService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(CasualCleanupService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly dataSource: DataSource) {}

  onApplicationBootstrap(): void {
    void this.cleanupExpired();
    this.timer = setInterval(() => void this.cleanupExpired(), CLEANUP_INTERVAL_MS);
    this.timer.unref();
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async cleanupExpired(): Promise<number> {
    try {
      const removed = await this.dataSource.query<Array<{ id: string }>>(
        'DELETE FROM casual_runs WHERE expires_at < now() RETURNING id',
      );
      if (removed.length) this.logger.log(`Removed ${removed.length} expired casual campaign(s).`);
      return removed.length;
    } catch (error) {
      this.logger.error('Failed to clean expired casual campaigns.', error instanceof Error ? error.stack : String(error));
      return 0;
    }
  }
}
