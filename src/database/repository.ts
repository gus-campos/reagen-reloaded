import type { Entity, Id, ManagedFields } from '@/database/persistence.types';

export type CreationDto<TEntity extends Entity<Id<string>>> = Omit<TEntity, ManagedFields>;

export type UpdateDto<TEntity extends Entity<Id<string>>> = Partial<CreationDto<TEntity>>;

export type GetOptions = {
  getDeleted?: boolean;
};

export interface Repository<TEntity extends Entity<Id<string>>> {
  create(dto: CreationDto<TEntity>): Promise<TEntity>;
  get(id: TEntity['id'], options?: GetOptions): Promise<TEntity | null>;
  getAll(options?: GetOptions): Promise<TEntity[]>;
  update(id: TEntity['id'], dto: UpdateDto<TEntity>): Promise<TEntity | null>;
  remove(id: TEntity['id']): Promise<boolean>;
}
