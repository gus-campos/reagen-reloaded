import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, defineStore, setActivePinia } from 'pinia';
import { generateId, now } from '@/infrastructure/database/persistence.dependencies';
import { Dimension, Unit } from '@/shared/types/unit.type';
import { InMemoryRepository } from '@tests/utils/in-memory.repository';
import {
  InMemoryPackageRepository,
  InMemoryReagentRepository,
  InMemoryVialRepository,
} from '@tests/utils/in-memory-feature-repositories';
import { NamedOptionCascadeRemovalService } from '@/features/named-options/named-option-cascade-removal.service';
import { NamedOptionService } from '@/features/named-options/named-option.service';
import type {
  Acquirer,
  ControlAgency,
  Laboratory,
  Supplier,
} from '@/features/named-options/options.type';
import { useNamedOptionCrud } from '@/features/named-options/use-named-option-crud';
import { PackageService } from '@/features/package/package.service';
import { ReagentService } from '@/features/reagent/reagent.service';
import { VialService } from '@/features/vial/vial.service';
import { useEntityCrud } from '@/shared/composables/use-entity-crud';

function createSut() {
  const controlAgencyService = new NamedOptionService<ControlAgency>(
    new InMemoryRepository<ControlAgency>(generateId, now),
  );
  const reagentService = new ReagentService(new InMemoryReagentRepository(generateId, now));
  const packageService = new PackageService(new InMemoryPackageRepository(generateId, now));
  const vialService = new VialService(new InMemoryVialRepository(generateId, now));
  const removalService = new NamedOptionCascadeRemovalService(
    (operation) => operation(),
    controlAgencyService,
    new NamedOptionService<Acquirer>(new InMemoryRepository<Acquirer>(generateId, now)),
    new NamedOptionService<Laboratory>(new InMemoryRepository<Laboratory>(generateId, now)),
    new NamedOptionService<Supplier>(new InMemoryRepository<Supplier>(generateId, now)),
    reagentService,
    packageService,
    vialService,
  );

  const useReagentStore = defineStore('reagents', () => useEntityCrud(reagentService));
  const useControlAgencyStore = defineStore('control-agencies', () =>
    useNamedOptionCrud('control-agency', controlAgencyService, removalService, (result) =>
      useReagentStore().evict(result.reagentIds),
    ),
  );

  return {
    reagentService,
    controlAgencyStore: useControlAgencyStore(),
    reagentStore: useReagentStore(),
  };
}

describe('useNamedOptionCrud', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('previews and removes through the cascade, evicting affected entities from other stores', async () => {
    const { reagentService, controlAgencyStore, reagentStore } = createSut();
    const agency = await controlAgencyStore.create({ name: 'Exército' });
    const reagent = await reagentService.create({
      name: 'Ácido sulfúrico',
      dimension: Dimension.Volume,
      sizes: [{ amount: 1, unit: Unit.Liter }],
      controlAgencyId: agency.id,
    });
    await reagentStore.load();

    await expect(controlAgencyStore.previewRemoval(agency.id)).resolves.toEqual({
      reagents: 1,
      packages: 0,
      vials: 0,
    });
    await expect(controlAgencyStore.remove(agency.id)).resolves.toBe(true);

    expect(controlAgencyStore.items).toEqual([]);
    expect(reagentStore.items).toEqual([]);
    await expect(reagentService.get(reagent.id)).resolves.toBeNull();
  });

  it('keeps the state unchanged when the option does not exist', async () => {
    const { controlAgencyStore } = createSut();
    const missingId = 'missing' as ControlAgency['id'];

    await expect(controlAgencyStore.previewRemoval(missingId)).resolves.toBeNull();
    await expect(controlAgencyStore.remove(missingId)).resolves.toBe(false);
    expect(controlAgencyStore.loading).toBe(false);
  });
});
