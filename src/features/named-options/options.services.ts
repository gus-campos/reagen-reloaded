import { appDatabase } from '@/database/app.database';
import { DexieRepository } from '@/database/repositories/dexie.repository';
import type { Acquirer, ControlAgency, Laboratory, Supplier } from './options.type';
import {
  AcquirerService,
  ControlAgencyService,
  LaboratoryService,
  SupplierService,
} from './options.service';
import { generateId, now } from '@/app/services';

export const controlAgencyService = new ControlAgencyService(
  new DexieRepository<ControlAgency>(appDatabase.controlAgencies, generateId, now),
);

export const acquirerService = new AcquirerService(
  new DexieRepository<Acquirer>(appDatabase.acquirers, generateId, now),
);

export const laboratoryService = new LaboratoryService(
  new DexieRepository<Laboratory>(appDatabase.laboratories, generateId, now),
);

export const supplierService = new SupplierService(
  new DexieRepository<Supplier>(appDatabase.suppliers, generateId, now),
);
