import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, defineStore, setActivePinia } from 'pinia';
import { generateId, now } from '@/database/persistence.dependencies';
import { Dimension, Unit } from '@/features/size/unit.type';

import { InMemoryRepository } from '@/test-utils/in-memory.repository';
import { ReagentService } from '@/features/reagent/reagent.service';
import type { Reagent } from '@/features/reagent/reagent.type';
import { useEntityStore } from '@/shared/use-entity-store';

const reagentDto = {
  name: 'Acetona',
  dimension: Dimension.Volume,
  sizes: [{ amount: 500, unit: Unit.Milliliter }],
  controlAgencyId: null,
};

describe('useEntityCrud with reagents', () => {
  beforeEach(() => setActivePinia(createPinia()));

  function createStore() {
    const service = new ReagentService(new InMemoryRepository<Reagent>(generateId, now));
    return defineStore('reagents', () => useEntityStore(service))();
  }

  it('loads and keeps the active reagents in reactive state', async () => {
    const store = createStore();
    await store.create(reagentDto);

    await store.load();

    expect(store.items).toHaveLength(1);
    expect(store.items[0]).toMatchObject({ name: 'Acetona' });
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('reflects creation, update and removal in the list', async () => {
    const store = createStore();
    const reagent = await store.create(reagentDto);

    await store.update(reagent.id, { name: 'Acetona P.A.' });
    expect(store.items[0]).toMatchObject({ id: reagent.id, name: 'Acetona P.A.' });

    await expect(store.remove(reagent.id)).resolves.toBe(true);
    expect(store.items).toEqual([]);
  });

  it('does not change the list when the reagent does not exist', async () => {
    const store = createStore();
    const missingId = 'missing' as Reagent['id'];

    await expect(store.update(missingId, { name: 'Inexistente' })).resolves.toBeNull();
    await expect(store.remove(missingId)).resolves.toBe(false);
    expect(store.items).toEqual([]);
  });

  it('exposes failures to the interface and releases the loading state', async () => {
    class FailingRepository extends InMemoryRepository<Reagent> {
      override async getAll(): Promise<Reagent[]> {
        throw new Error('Banco indisponível');
      }
    }

    const store = defineStore('reagents', () =>
      useEntityStore(new ReagentService(new FailingRepository(generateId, now))),
    )();

    await expect(store.load()).rejects.toThrow('Banco indisponível');
    expect(store.error).toMatchObject({ message: 'Banco indisponível' });
    expect(store.loading).toBe(false);
  });
});
