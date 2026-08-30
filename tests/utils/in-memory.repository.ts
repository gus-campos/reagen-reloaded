import type { Dayjs } from 'dayjs';
import type { Entity, Id } from '@/infrastructure/database/persistence.types';
import type {
  CreationDto,
  GetOptions,
  Repository,
  UpdateDto,
} from '@/infrastructure/database/repository';

export class InMemoryRepository<TEntity extends Entity<Id<string>>> implements Repository<TEntity> {
  private readonly entities: TEntity[] = [];

  constructor(
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
    this.entities.push(entity);
    return entity;
  }

  async get(id: TEntity['id'], options?: GetOptions): Promise<TEntity | null> {
    const entity = this.entities.find((item) => item.id === id);
    return entity && (options?.getDeleted || entity.deletedAt === null) ? entity : null;
  }

  async getAll(options?: GetOptions): Promise<TEntity[]> {
    return options?.getDeleted ? this.entities : this.entities.filter((entity) => entity.deletedAt === null);
  }

  async update(id: TEntity['id'], dto: UpdateDto<TEntity>): Promise<TEntity | null> {
    const entity = await this.get(id);
    if (!entity) return null;
    Object.assign(entity, dto, { updatedAt: this.now() });
    return entity;
  }

  async remove(id: TEntity['id']): Promise<boolean> {
    const entity = await this.get(id);
    if (!entity) return false;
    entity.deletedAt = this.now();
    return true;
  }
}
