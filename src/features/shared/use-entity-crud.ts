import { ref, type Ref } from 'vue';
import type { Entity, Id } from '@/database/persistence.types';
import type { CreationDto, UpdateDto } from '@/database/repository';
import { EntityService } from './entity.service';

export function useEntityStore<TEntity extends Entity<Id<string>>>(
  service: EntityService<TEntity>,
) {
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
    const entity = await run(() => service.update(id, dto));
    if (!entity) return null;

    const index = items.value.findIndex((item) => item.id === id);
    if (index >= 0) items.value.splice(index, 1, entity);

    return entity;
  }

  async function remove(id: TEntity['id']): Promise<boolean> {
    const removed = await run(() => service.remove(id));
    if (removed) items.value = items.value.filter((item) => item.id !== id);

    return removed;
  }

  return { items, loading, error, load, create, update, remove };
}
