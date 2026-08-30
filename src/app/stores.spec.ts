import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  useControlAgencyStore,
  useFundingSourceStore,
  useLaboratoryStore,
  usePackageStore,
  useReagentStore,
  useSupplierStore,
  useVialStore,
} from './stores';

describe('application stores', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('registers one store for each persisted entity', () => {
    const stores = [
      useControlAgencyStore(),
      useFundingSourceStore(),
      useLaboratoryStore(),
      usePackageStore(),
      useReagentStore(),
      useSupplierStore(),
      useVialStore(),
    ];

    expect(stores.map((store) => store.$id)).toEqual([
      'control-agencies',
      'funding-sources',
      'laboratories',
      'packages',
      'reagents',
      'suppliers',
      'vials',
    ]);
  });
});
