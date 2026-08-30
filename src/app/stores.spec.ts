import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  useControlAgencyStore,
  useAcquirerStore,
  useLaboratoryStore,
  usePackageStore,
  useReagentStore,
  useSupplierStore,
  useVialStore,
} from '@/app/stores';

describe('application stores', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('registers one store for each persisted entity', () => {
    const stores = [
      useControlAgencyStore(),
      useAcquirerStore(),
      useLaboratoryStore(),
      usePackageStore(),
      useReagentStore(),
      useSupplierStore(),
      useVialStore(),
    ];

    expect(stores.map((store) => store.$id)).toEqual([
      'control-agencies',
      'acquirers',
      'laboratories',
      'packages',
      'reagents',
      'suppliers',
      'vials',
    ]);
  });
});
