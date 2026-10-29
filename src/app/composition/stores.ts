import { defineStore } from 'pinia';
import {
  acquirerService,
  controlAgencyService,
  laboratoryService,
  packageService,
  reagentService,
  supplierService,
  vialService,
} from '@/app/composition/services';
import type { CascadeRemovalResult } from '@/features/named-options/cascade-removal.type';
import type { NamedOptionKind } from '@/features/named-options/named-option-kind';
import {
  useNamedOptionCrud,
  type NamedOptionStore,
} from '@/features/named-options/use-named-option-crud';
import { useReagentCrud } from '@/features/reagent/use-reagent-crud';
import { useEntityCrud } from '@/shared/composables/use-entity-crud';

function syncStoresAfterCascade(result: CascadeRemovalResult): void {
  useReagentStore().evict(result.reagentIds);
  usePackageStore().evict(result.packageIds);
  useVialStore().evict(result.vialIds);
}

export const useControlAgencyStore = defineStore('control-agencies', () =>
  useNamedOptionCrud(controlAgencyService, syncStoresAfterCascade),
);

export const useAcquirerStore = defineStore('acquirers', () =>
  useNamedOptionCrud(acquirerService, syncStoresAfterCascade),
);

export const useLaboratoryStore = defineStore('laboratories', () =>
  useNamedOptionCrud(laboratoryService, syncStoresAfterCascade),
);

export const usePackageStore = defineStore('packages', () => useEntityCrud(packageService));

export const useReagentStore = defineStore('reagents', () =>
  useReagentCrud(reagentService, syncStoresAfterCascade),
);

export const useSupplierStore = defineStore('suppliers', () =>
  useNamedOptionCrud(supplierService, syncStoresAfterCascade),
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
