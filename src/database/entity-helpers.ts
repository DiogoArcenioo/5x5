import type { EntitySchemaColumnOptions } from 'typeorm';

export const uuidId: EntitySchemaColumnOptions = {
  type: 'uuid',
  primary: true,
  generated: 'uuid',
};

export const identitySmallint: EntitySchemaColumnOptions = {
  type: 'smallint',
  primary: true,
  generated: 'increment',
};

export const createdAt: EntitySchemaColumnOptions = {
  name: 'created_at',
  type: 'timestamptz',
  createDate: true,
};

export const updatedAt: EntitySchemaColumnOptions = {
  name: 'updated_at',
  type: 'timestamptz',
  updateDate: true,
};
