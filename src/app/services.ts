import dayjs from 'dayjs';
import { appDatabase } from '@/database/app.database';
import { DexieRepository } from '@/database/repositories/dexie.repository';
import {
  AcquirerService,
  ControlAgencyService,
  LaboratoryService,
  SupplierService,
} from '@/features/named-options/options.service';
import { PackageService } from '@/features/package/package.service';
import { ReagentService } from '@/features/reagent/reagent.service';
import { VialService } from '@/features/vial/vial.service';

const now = () => dayjs();

export const reagentService = new ReagentService(
  new DexieRepository(appDatabase.reagents, undefined, now),
);

export const controlAgencyService = new ControlAgencyService(
  new DexieRepository(appDatabase.controlAgencies, undefined, now),
);

export const acquirerService = new AcquirerService(
  new DexieRepository(appDatabase.acquirers, undefined, now),
);

export const laboratoryService = new LaboratoryService(
  new DexieRepository(appDatabase.laboratories, undefined, now),
);

export const packageService = new PackageService(
  new DexieRepository(appDatabase.packages, undefined, now),
);

export const supplierService = new SupplierService(
  new DexieRepository(appDatabase.suppliers, undefined, now),
);

export const vialService = new VialService(
  new DexieRepository(appDatabase.vials, undefined, now),
);
