import dayjs from 'dayjs';
import { appDatabase } from '@/database/app.database';
import { DexieRepository } from '@/database/repositories/dexie.repository';
import type {
  Acquirer,
  ControlAgency,
  Laboratory,
  Supplier,
} from './options.type';
import {
  AcquirerService,
  ControlAgencyService,
  LaboratoryService,
  SupplierService,
} from './options.service';

export const controlAgencyService = new ControlAgencyService(
  new DexieRepository<ControlAgency>(appDatabase.controlAgencies, undefined, dayjs),
);

export const acquirerService = new AcquirerService(
  new DexieRepository<Acquirer>(appDatabase.acquirers, undefined, dayjs),
);

export const laboratoryService = new LaboratoryService(
  new DexieRepository<Laboratory>(appDatabase.laboratories, undefined, dayjs),
);

export const supplierService = new SupplierService(
  new DexieRepository<Supplier>(appDatabase.suppliers, undefined, dayjs),
);
