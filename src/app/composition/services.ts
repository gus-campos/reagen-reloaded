import { appDatabase } from '@/infrastructure/database/app.database';
import { generateId, now } from '@/infrastructure/database/persistence.dependencies';
import { DexieRepository } from '@/infrastructure/database/repositories/dexie.repository';
import { DexiePackageRepository } from '@/infrastructure/database/repositories/dexie-package.repository';
import { DexieReagentRepository } from '@/infrastructure/database/repositories/dexie-reagent.repository';
import { DexieVialRepository } from '@/infrastructure/database/repositories/dexie-vial.repository';
import { AcquirerService } from '@/features/named-options/acquirer.service';
import type {
  CascadeRemovalDependencies,
  TransactionRunner,
} from '@/features/named-options/cascade-removal.type';
import { ControlAgencyService } from '@/features/named-options/control-agency.service';
import { LaboratoryService } from '@/features/named-options/laboratory.service';
import type {
  Acquirer,
  ControlAgency,
  Laboratory,
  Supplier,
} from '@/features/named-options/options.type';
import { SupplierService } from '@/features/named-options/supplier.service';
import { PackageService } from '@/features/package/package.service';
import { ReagentService } from '@/features/reagent/reagent.service';
import { VialService } from '@/features/vial/vial.service';

export const packageService = new PackageService(
  new DexiePackageRepository(appDatabase.packages, generateId, now),
);
export const vialService = new VialService(
  new DexieVialRepository(appDatabase.vials, generateId, now),
);

const runInTransaction: TransactionRunner = (operation) =>
  appDatabase.transaction(
    'rw',
    [
      appDatabase.acquirers,
      appDatabase.controlAgencies,
      appDatabase.laboratories,
      appDatabase.packages,
      appDatabase.reagents,
      appDatabase.suppliers,
      appDatabase.vials,
    ],
    operation,
  );

export const reagentService = new ReagentService(
  new DexieReagentRepository(appDatabase.reagents, generateId, now),
  { runInTransaction, packageService, vialService },
);

const cascadeRemovalDependencies: CascadeRemovalDependencies = {
  runInTransaction,
  reagentService,
  packageService,
  vialService,
};

export const controlAgencyService = new ControlAgencyService(
  new DexieRepository<ControlAgency>(appDatabase.controlAgencies, generateId, now),
  cascadeRemovalDependencies,
);
export const acquirerService = new AcquirerService(
  new DexieRepository<Acquirer>(appDatabase.acquirers, generateId, now),
  cascadeRemovalDependencies,
);
export const laboratoryService = new LaboratoryService(
  new DexieRepository<Laboratory>(appDatabase.laboratories, generateId, now),
  cascadeRemovalDependencies,
);
export const supplierService = new SupplierService(
  new DexieRepository<Supplier>(appDatabase.suppliers, generateId, now),
  cascadeRemovalDependencies,
);
