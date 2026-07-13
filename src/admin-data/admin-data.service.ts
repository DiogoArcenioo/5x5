import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityMetadata, ObjectLiteral, Repository } from 'typeorm';
import { ListRecordsDto } from './dto/admin-data.dto';
import { RESOURCE_REGISTRY, ResourceDefinition } from './resource-registry';

@Injectable()
export class AdminDataService {
  constructor(private readonly dataSource: DataSource) {}

  describeResources(): Array<Record<string, unknown>> {
    return Object.entries(RESOURCE_REGISTRY).map(([code, definition]) => {
      const metadata = this.repository(definition).metadata;
      return {
        code,
        label: definition.label,
        description: definition.description,
        primaryKeys: metadata.primaryColumns.map((column) => column.propertyName),
        fields: metadata.columns.map((column) => ({
          name: column.propertyName,
          databaseName: column.databaseName,
          type: String(column.type),
          nullable: column.isNullable,
          generated: column.isGenerated,
          primary: column.isPrimary,
        })),
      };
    });
  }

  async list(resource: string, query: ListRecordsDto): Promise<Record<string, unknown>> {
    const definition = this.definition(resource);
    const repository = this.repository(definition);
    const metadata = repository.metadata;
    const builder = repository.createQueryBuilder('record');

    if (query.search?.trim() && definition.searchFields.length > 0) {
      const searchColumns = definition.searchFields.map((field) => this.column(metadata, field));
      builder.andWhere(
        `(${searchColumns.map((column) => `CAST(record.${column.databaseName} AS text) ILIKE :search`).join(' OR ')})`,
        { search: `%${query.search.trim()}%` },
      );
    }

    const filters = this.parseFilters(query.filters);
    for (const [field, value] of Object.entries(filters)) {
      const column = this.column(metadata, field);
      if (value === null) {
        builder.andWhere(`record.${column.databaseName} IS NULL`);
      } else {
        builder.andWhere(`record.${column.databaseName} = :filter_${field}`, { [`filter_${field}`]: value });
      }
    }

    const defaultSort = metadata.primaryColumns[0]?.propertyName;
    const sortColumn = this.column(metadata, query.sort ?? defaultSort);
    builder.orderBy(`record.${sortColumn.databaseName}`, query.order);
    builder.skip((query.page - 1) * query.pageSize).take(query.pageSize);

    const [data, total] = await builder.getManyAndCount();
    return {
      data,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(resource: string, key: Record<string, unknown>): Promise<ObjectLiteral> {
    const definition = this.definition(resource);
    const repository = this.repository(definition);
    const where = this.validatedKey(repository.metadata, key);
    const record = await repository.findOne({ where });
    if (!record) throw new NotFoundException('Registro não encontrado.');
    return record;
  }

  async create(resource: string, payload: Record<string, unknown>): Promise<ObjectLiteral> {
    const definition = this.definition(resource);
    const repository = this.repository(definition);
    const clean = this.sanitize(repository.metadata, payload, true);
    return repository.save(repository.create(clean));
  }

  async update(
    resource: string,
    key: Record<string, unknown>,
    payload: Record<string, unknown>,
  ): Promise<ObjectLiteral> {
    const definition = this.definition(resource);
    const repository = this.repository(definition);
    const where = this.validatedKey(repository.metadata, key);
    const current = await repository.findOne({ where });
    if (!current) throw new NotFoundException('Registro não encontrado.');

    const clean = this.sanitize(repository.metadata, payload, false);
    for (const primary of repository.metadata.primaryColumns) delete clean[primary.propertyName];
    const merged = repository.merge(current, clean);
    return repository.save(merged);
  }

  async remove(resource: string, key: Record<string, unknown>): Promise<{ deleted: true }> {
    const definition = this.definition(resource);
    const repository = this.repository(definition);
    const where = this.validatedKey(repository.metadata, key);
    const current = await repository.findOne({ where });
    if (!current) throw new NotFoundException('Registro não encontrado.');
    await repository.remove(current);
    return { deleted: true };
  }

  private definition(resource: string): ResourceDefinition {
    const definition = RESOURCE_REGISTRY[resource];
    if (!definition) throw new NotFoundException(`Recurso administrativo desconhecido: ${resource}`);
    return definition;
  }

  private repository(definition: ResourceDefinition): Repository<ObjectLiteral> {
    return this.dataSource.getRepository(definition.entity);
  }

  private column(metadata: EntityMetadata, propertyName?: string) {
    if (!propertyName) throw new BadRequestException('O recurso não possui chave ou campo de ordenação.');
    const column = metadata.findColumnWithPropertyName(propertyName);
    if (!column) throw new BadRequestException(`Campo desconhecido: ${propertyName}`);
    return column;
  }

  private parseFilters(raw?: string): Record<string, unknown> {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error();
      return parsed as Record<string, unknown>;
    } catch {
      throw new BadRequestException('filters deve ser um objeto JSON válido.');
    }
  }

  private validatedKey(metadata: EntityMetadata, key: Record<string, unknown>): ObjectLiteral {
    const requiredKeys = metadata.primaryColumns.map((column) => column.propertyName);
    const receivedKeys = Object.keys(key);
    const missing = requiredKeys.filter((field) => key[field] === undefined || key[field] === null || key[field] === '');
    const extra = receivedKeys.filter((field) => !requiredKeys.includes(field));
    if (missing.length || extra.length) {
      throw new BadRequestException({
        message: 'Chave do registro inválida.',
        requiredKeys,
        missing,
        extra,
      });
    }
    return key;
  }

  private sanitize(
    metadata: EntityMetadata,
    payload: Record<string, unknown>,
    creating: boolean,
  ): ObjectLiteral {
    const allowed = new Map(metadata.columns.map((column) => [column.propertyName, column]));
    const forbidden = Object.keys(payload).filter((field) => !allowed.has(field));
    if (forbidden.length) {
      throw new BadRequestException({ message: 'Campos desconhecidos.', fields: forbidden });
    }

    if (creating) {
      const missing = metadata.columns
        .filter((column) => !column.isGenerated && !column.isNullable && column.default === undefined && !column.isCreateDate && !column.isUpdateDate)
        .map((column) => column.propertyName)
        .filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
      if (missing.length) throw new BadRequestException({ message: 'Campos obrigatórios ausentes.', fields: missing });
    }

    return { ...payload };
  }
}
