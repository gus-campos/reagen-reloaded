import { appDatabase } from '@/database/app.database';
import { generateId, now } from '@/database/persistence.dependencies';
import { DexieRepository } from '@/database/repositories/dexie.repository';
import type { Acquirer, ControlAgency, Laboratory, Supplier } from '@/features/named-options/options.type';
import {
  AcquirerService,
  ControlAgencyService,
  LaboratoryService,
  SupplierService,
} from '@/features/named-options/options.service';
import { PackageService } from '@/features/package/package.service';
import { ReagentService } from '@/features/reagent/reagent.service';
import { VialService } from '@/features/vial/vial.service';

export const controlAgencyService = new ControlAgencyService(
  new DexieRepository<ControlAgency>(appDatabase.controlAgencies, generateId, now),
);

export const acquirerService = new AcquirerService(
  new DexieRepository<Acquirer>(appDatabase.acquirers, generateId, now),
);

export const laboratoryService = new LaboratoryService(
  new DexieRepository<Laboratory>(appDatabase.laboratories, generateId, now),
);

export const packageService = new PackageService(
  new DexieRepository(appDatabase.packages, generateId, now),
);

export const reagentService = new ReagentService(
  new DexieRepository(appDatabase.reagents, generateId, now),
);

export const supplierService = new SupplierService(
  new DexieRepository<Supplier>(appDatabase.suppliers, generateId, now),
);

export const vialService = new VialService(new DexieRepository(appDatabase.vials, generateId, now));
