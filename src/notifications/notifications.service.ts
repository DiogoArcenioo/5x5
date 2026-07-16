import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateNotificationDto, ListAdminNotificationsDto, UpdateNotificationDto } from './dto/notifications.dto';

type NotificationRow = {
  id: number;
  title: string;
  message: string;
  type: 'news' | 'update' | 'warning' | 'maintenance';
  status: 'draft' | 'published';
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
};

const SELECT_FIELDS = `
  n.id, n.title, n.message, n.type, n.status,
  n.published_at AS "publishedAt", n.expires_at AS "expiresAt",
  n.created_at AS "createdAt", n.updated_at AS "updatedAt",
  u.username AS "createdBy"`;

@Injectable()
export class NotificationsService {
  constructor(private readonly dataSource: DataSource) {}

  async listPublic() {
    return this.dataSource.query<NotificationRow[]>(`
      SELECT ${SELECT_FIELDS}
      FROM game_notifications n
      LEFT JOIN app_users u ON u.id = n.created_by
      WHERE n.status = 'published'
        AND n.published_at IS NOT NULL
        AND n.published_at <= now()
        AND (n.expires_at IS NULL OR n.expires_at > now())
      ORDER BY n.published_at DESC, n.id DESC
      LIMIT 20
    `);
  }

  async listAdmin(query: ListAdminNotificationsDto) {
    const conditions: string[] = [];
    const values: unknown[] = [];
    if (query.search.trim()) {
      values.push(`%${query.search.trim()}%`);
      conditions.push(`(n.title ILIKE $${values.length} OR n.message ILIKE $${values.length})`);
    }
    if (query.status !== 'all') {
      values.push(query.status);
      conditions.push(`n.status = $${values.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    values.push(query.pageSize, (query.page - 1) * query.pageSize);
    const data = await this.dataSource.query<NotificationRow[]>(`
      SELECT ${SELECT_FIELDS}
      FROM game_notifications n
      LEFT JOIN app_users u ON u.id = n.created_by
      ${where}
      ORDER BY n.created_at DESC, n.id DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `, values);
    const [count] = await this.dataSource.query<Array<{ total: number }>>(
      `SELECT count(n.id)::integer AS total FROM game_notifications n ${where}`,
      countValues,
    );
    return {
      data,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total: count.total,
        totalPages: Math.ceil(count.total / query.pageSize),
      },
    };
  }

  async create(dto: CreateNotificationDto, userId: number) {
    const publishedAt = dto.status === 'published' ? dto.publishedAt || new Date().toISOString() : dto.publishedAt || null;
    this.assertPeriod(publishedAt, dto.expiresAt || null);
    const rows = await this.dataSource.query<NotificationRow[]>(`
      INSERT INTO game_notifications (title, message, type, status, published_at, expires_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, message, type, status, published_at AS "publishedAt",
                expires_at AS "expiresAt", created_at AS "createdAt", updated_at AS "updatedAt"
    `, [dto.title.trim(), dto.message.trim(), dto.type, dto.status, publishedAt, dto.expiresAt || null, userId]);
    return rows[0];
  }

  async update(id: number, dto: UpdateNotificationDto) {
    const current = await this.requireNotification(id);
    if (!Object.keys(dto).length) throw new ConflictException('Nenhuma alteração foi informada.');
    const status = dto.status ?? current.status;
    let publishedAt = dto.publishedAt === undefined ? current.publishedAt : dto.publishedAt;
    if (status === 'published' && !publishedAt) publishedAt = new Date().toISOString();
    const expiresAt = dto.expiresAt === undefined ? current.expiresAt : dto.expiresAt;
    this.assertPeriod(publishedAt, expiresAt);
    const rows = await this.dataSource.query<NotificationRow[]>(`
      UPDATE game_notifications
      SET title = $2, message = $3, type = $4, status = $5,
          published_at = $6, expires_at = $7, updated_at = now()
      WHERE id = $1
      RETURNING id, title, message, type, status, published_at AS "publishedAt",
                expires_at AS "expiresAt", created_at AS "createdAt", updated_at AS "updatedAt"
    `, [
      id,
      dto.title?.trim() ?? current.title,
      dto.message?.trim() ?? current.message,
      dto.type ?? current.type,
      status,
      publishedAt,
      expiresAt,
    ]);
    return rows[0];
  }

  async remove(id: number) {
    const rows = await this.dataSource.query<Array<{ id: number }>>(
      'DELETE FROM game_notifications WHERE id = $1 RETURNING id',
      [id],
    );
    if (!rows[0]) throw new NotFoundException('Notificação não encontrada.');
    return { deleted: true, id };
  }

  private async requireNotification(id: number): Promise<NotificationRow> {
    const rows = await this.dataSource.query<NotificationRow[]>(`
      SELECT ${SELECT_FIELDS}
      FROM game_notifications n
      LEFT JOIN app_users u ON u.id = n.created_by
      WHERE n.id = $1
    `, [id]);
    if (!rows[0]) throw new NotFoundException('Notificação não encontrada.');
    return rows[0];
  }

  private assertPeriod(publishedAt: string | null, expiresAt: string | null) {
    if (publishedAt && expiresAt && new Date(expiresAt) <= new Date(publishedAt)) {
      throw new ConflictException('A expiração deve acontecer depois da publicação.');
    }
  }
}

