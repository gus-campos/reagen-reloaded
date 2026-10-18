import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  useAcquirerStore,
  useControlAgencyStore,
  useLaboratoryStore,
  usePackageStore,
  useReagentStore,
  useSupplierStore,
  useVialStore,
} from '@/app/composition/stores';

describe('application stores', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('registers one store for each persisted entity', () => {
    expect([
      useControlAgencyStore().$id,
      useAcquirerStore().$id,
      useLaboratoryStore().$id,
      usePackageStore().$id,
      useReagentStore().$id,
      useSupplierStore().$id,
      useVialStore().$id,
    ]).toEqual([
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
