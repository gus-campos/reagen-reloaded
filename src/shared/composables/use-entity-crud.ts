import { ref, type Ref } from 'vue';
import type { Entity, Id } from '@/infrastructure/database/persistence.types';
import type { CreationDto, UpdateDto } from '@/infrastructure/database/repository';
import { EntityService } from '@/shared/services/entity.service';

export type EntityCrudOptions<TEntity extends Entity<Id<string>>> = {
  update?: (id: TEntity['id'], dto: UpdateDto<TEntity>) => Promise<TEntity | null>;
  remove?: (id: TEntity['id']) => Promise<boolean>;
};

export function useEntityCrud<TEntity extends Entity<Id<string>>>(
  service: EntityService<TEntity>,
  options: EntityCrudOptions<TEntity> = {},
) {
  const updateEntity = options.update ?? ((id, dto) => service.update(id, dto));
  const removeEntity = options.remove ?? ((id) => service.remove(id));
  const items = ref([]) as Ref<TEntity[]>;
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function run<T>(operation: () => Promise<T>): Promise<T> {
    loading.value = true;
    error.value = null;

    try {
      return await operation();
    } catch (reason) {
      error.value = reason instanceof Error ? reason : new Error(String(reason));
      throw reason;
    } finally {
      loading.value = false;
    }
  }

  async function load(): Promise<void> {
    items.value = await run(() => service.getAll());
  }

  async function create(dto: CreationDto<TEntity>): Promise<TEntity> {
    const entity = await run(() => service.create(dto));
    items.value.push(entity);
    return entity;
  }

  async function update(id: TEntity['id'], dto: UpdateDto<TEntity>): Promise<TEntity | null> {
    const entity = await run(() => updateEntity(id, dto));
    if (!entity) return null;

    const index = items.value.findIndex((item) => item.id === id);
    if (index >= 0) items.value.splice(index, 1, entity);
    return entity;
  }

  async function remove(id: TEntity['id']): Promise<boolean> {
    const removed = await run(() => removeEntity(id));
    if (removed) evict(new Set([id]));
    return removed;
  }

  // Remove itens apenas do estado local, sem persistir (ex.: após remoção em cascata).
  function evict(ids: ReadonlySet<TEntity['id']>): void {
    if (ids.size === 0) return;
    items.value = items.value.filter((item) => !ids.has(item.id));
  }

  return { items, loading, error, load, create, update, remove, evict };
}
