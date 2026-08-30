import { defineStore } from 'pinia';
import { useEntityStore } from '@/features/shared/use-entity-crud';
import {
  controlAgencyService,
  acquirerService,
  laboratoryService,
  packageService,
  reagentService,
  supplierService,
  vialService,
} from './services';

export const useControlAgencyStore = defineStore('control-agencies', () =>
  useEntityStore(controlAgencyService),
);

export const useAcquirerStore = defineStore('acquirers', () =>
  useEntityStore(acquirerService),
);

export const useLaboratoryStore = defineStore('laboratories', () => useEntityStore(laboratoryService));

export const usePackageStore = defineStore('packages', () => useEntityStore(packageService));

export const useReagentStore = defineStore('reagents', () => useEntityStore(reagentService));

export const useSupplierStore = defineStore('suppliers', () => useEntityStore(supplierService));

export const useVialStore = defineStore('vials', () => useEntityStore(vialService));
