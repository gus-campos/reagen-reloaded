import { defineStore } from 'pinia';
import {
  acquirerService,
  controlAgencyService,
  laboratoryService,
  namedOptionCascadeRemovalService,
  packageService,
  reagentService,
  supplierService,
  vialService,
} from '@/app/composition/services';
import type { CascadeRemovalResult } from '@/features/named-options/named-option-cascade-removal.service';
import type { NamedOptionKind } from '@/features/named-options/named-option-kind';
import {
  useNamedOptionCrud,
  type NamedOptionStore,
} from '@/features/named-options/use-named-option-crud';
import { useEntityCrud } from '@/shared/composables/use-entity-crud';

function evictCascadeRemoval(result: CascadeRemovalResult): void {
  useReagentStore().evict(result.reagentIds);
  usePackageStore().evict(result.packageIds);
  useVialStore().evict(result.vialIds);
}

export const useControlAgencyStore = defineStore('control-agencies', () =>
  useNamedOptionCrud(
    'control-agency',
    controlAgencyService,
    namedOptionCascadeRemovalService,
    evictCascadeRemoval,
  ),
);
export const useAcquirerStore = defineStore('acquirers', () =>
  useNamedOptionCrud(
    'acquirer',
    acquirerService,
    namedOptionCascadeRemovalService,
    evictCascadeRemoval,
  ),
);
export const useLaboratoryStore = defineStore('laboratories', () =>
  useNamedOptionCrud(
    'laboratory',
    laboratoryService,
    namedOptionCascadeRemovalService,
    evictCascadeRemoval,
  ),
);
export const usePackageStore = defineStore('packages', () => useEntityCrud(packageService));
export const useReagentStore = defineStore('reagents', () => useEntityCrud(reagentService));
export const useSupplierStore = defineStore('suppliers', () =>
  useNamedOptionCrud(
    'supplier',
    supplierService,
    namedOptionCascadeRemovalService,
    evictCascadeRemoval,
  ),
);
export const useVialStore = defineStore('vials', () => useEntityCrud(vialService));

const NAMED_OPTION_STORES = {
  'control-agency': useControlAgencyStore,
  acquirer: useAcquirerStore,
  laboratory: useLaboratoryStore,
  supplier: useSupplierStore,
} satisfies Record<NamedOptionKind, () => NamedOptionStore>;

export function useNamedOptionStore(kind: NamedOptionKind): NamedOptionStore {
  return NAMED_OPTION_STORES[kind]();
}
