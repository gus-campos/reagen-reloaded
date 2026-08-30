import dayjs from 'dayjs';
import { appDatabase } from '@/database/app.database';
import { DexieRepository } from '@/database/repositories/dexie.repository';
import type {
  ControlAgency,
  FundingSource,
  Laboratory,
  Supplier,
} from './options.type';
import {
  ControlAgencyService,
  FundingSourceService,
  LaboratoryService,
  SupplierService,
} from './options.service';

export const controlAgencyService = new ControlAgencyService(
  new DexieRepository<ControlAgency>(appDatabase.controlAgencies, undefined, dayjs),
);

export const fundingSourceService = new FundingSourceService(
  new DexieRepository<FundingSource>(appDatabase.fundingSources, undefined, dayjs),
);

export const laboratoryService = new LaboratoryService(
  new DexieRepository<Laboratory>(appDatabase.laboratories, undefined, dayjs),
);

export const supplierService = new SupplierService(
  new DexieRepository<Supplier>(appDatabase.suppliers, undefined, dayjs),
);
