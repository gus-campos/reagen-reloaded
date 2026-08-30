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
import { useEntityCrud } from '@/shared/composables/use-entity-crud';

export const useControlAgencyStore = defineStore('control-agencies', () =>
  useEntityCrud(controlAgencyService),
);
export const useAcquirerStore = defineStore('acquirers', () => useEntityCrud(acquirerService));
export const useLaboratoryStore = defineStore('laboratories', () => useEntityCrud(laboratoryService));
export const usePackageStore = defineStore('packages', () => useEntityCrud(packageService));
export const useReagentStore = defineStore('reagents', () => useEntityCrud(reagentService));
export const useSupplierStore = defineStore('suppliers', () => useEntityCrud(supplierService));
export const useVialStore = defineStore('vials', () => useEntityCrud(vialService));
