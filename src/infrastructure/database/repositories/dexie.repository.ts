import { type Dayjs } from 'dayjs';
import type { Table } from 'dexie';
import type { Entity, Id } from '@/infrastructure/database/persistence.types';
import type {
  CreationDto,
  GetOptions,
  Repository,
  UpdateDto,
} from '@/infrastructure/database/repository';

export class DexieRepository<TEntity extends Entity<Id<string>>> implements Repository<TEntity> {
  constructor(
    private readonly table: Table<TEntity, TEntity['id']>,
    private readonly generateId: () => TEntity['id'],
    private readonly now: () => Dayjs,
  ) {}

  async create(dto: CreationDto<TEntity>): Promise<TEntity> {
    const timestamp = this.now();
    const entity = {
      ...dto,
      id: this.generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    } as TEntity;

    await this.table.add(entity);
    return entity;
  }

  async get(id: TEntity['id'], options?: GetOptions): Promise<TEntity | null> {
    const entity = await this.table.get(id);

    if (!entity) return null;
    if (!options?.getDeleted && entity.deletedAt !== null) return null;

    return entity;
  }

  async getAll(options?: GetOptions): Promise<TEntity[]> {
    if (options?.getDeleted) return this.table.toArray();

    return this.table.filter((entity) => entity.deletedAt === null).toArray();
  }

  async update(id: TEntity['id'], dto: UpdateDto<TEntity>): Promise<TEntity | null> {
    const entity = await this.get(id);
    if (!entity) return null;

    const updatedEntity = {
      ...entity,
      ...dto,
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: this.now(),
      deletedAt: entity.deletedAt,
    } as TEntity;

    await this.table.put(updatedEntity);
    return updatedEntity;
  }

  async remove(id: TEntity['id']): Promise<boolean> {
    const entity = await this.get(id);
    if (!entity) return false;

    const timestamp = this.now();
    await this.table.put({ ...entity, updatedAt: timestamp, deletedAt: timestamp });
    return true;
  }
}
