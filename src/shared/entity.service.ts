import type { Entity, Id } from '@/database/persistence.types';
import type { CreationDto, GetOptions, Repository, UpdateDto } from '@/database/repository';

export class EntityService<TEntity extends Entity<Id<string>>> {
  constructor(protected readonly repository: Repository<TEntity>) {}

  create(dto: CreationDto<TEntity>): Promise<TEntity> {
    return this.repository.create(dto);
  }

  get(id: TEntity['id'], options?: GetOptions): Promise<TEntity | null> {
    return this.repository.get(id, options);
  }

  getAll(): Promise<TEntity[]> {
    return this.repository.getAll();
  }

  update(id: TEntity['id'], dto: UpdateDto<TEntity>): Promise<TEntity | null> {
    return this.repository.update(id, dto);
  }

  remove(id: TEntity['id']): Promise<boolean> {
    return this.repository.remove(id);
  }
}
