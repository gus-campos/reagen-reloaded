import { defineStore } from 'pinia';
import {
  acquirerService,
  controlAgencyService,
  laboratoryService,
  packageService,
  reagentService,
  supplierService,
  vialService,
} from './services';
import { useEntityStore } from '@/shared/use-entity-store';

export const useControlAgencyStore = defineStore('control-agencies', () =>
  useEntityStore(controlAgencyService),
);

export const useAcquirerStore = defineStore('acquirers', () => useEntityStore(acquirerService));

export const useLaboratoryStore = defineStore('laboratories', () =>
  useEntityStore(laboratoryService),
);

export const usePackageStore = defineStore('packages', () => useEntityStore(packageService));

export const useReagentStore = defineStore('reagents', () => useEntityStore(reagentService));

export const useSupplierStore = defineStore('suppliers', () => useEntityStore(supplierService));

export const useVialStore = defineStore('vials', () => useEntityStore(vialService));
