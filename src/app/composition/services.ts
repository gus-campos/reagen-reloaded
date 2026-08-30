import { appDatabase } from '@/infrastructure/database/app.database';
import { generateId, now } from '@/infrastructure/database/persistence.dependencies';
import { DexieRepository } from '@/infrastructure/database/repositories/dexie.repository';
import type { Acquirer, ControlAgency, Laboratory, Supplier } from '@/features/named-options/options.type';
import { NamedOptionService } from '@/features/named-options/named-option.service';
import { PackageService } from '@/features/package/package.service';
import { ReagentService } from '@/features/reagent/reagent.service';
import { VialService } from '@/features/vial/vial.service';

export const controlAgencyService = new NamedOptionService<ControlAgency>(
  new DexieRepository<ControlAgency>(appDatabase.controlAgencies, generateId, now),
);
export const acquirerService = new NamedOptionService<Acquirer>(
  new DexieRepository<Acquirer>(appDatabase.acquirers, generateId, now),
);
export const laboratoryService = new NamedOptionService<Laboratory>(
  new DexieRepository<Laboratory>(appDatabase.laboratories, generateId, now),
);
export const packageService = new PackageService(
  new DexieRepository(appDatabase.packages, generateId, now),
);
export const reagentService = new ReagentService(
  new DexieRepository(appDatabase.reagents, generateId, now),
);
export const supplierService = new NamedOptionService<Supplier>(
  new DexieRepository<Supplier>(appDatabase.suppliers, generateId, now),
);
export const vialService = new VialService(new DexieRepository(appDatabase.vials, generateId, now));
