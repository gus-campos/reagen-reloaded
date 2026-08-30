import Dexie, { type Table } from 'dexie';
import type {
  ControlAgency,
  FundingSource,
  Laboratory,
  Supplier,
} from '@/features/named-options/options.type';
import type { Package } from '@/features/package/package.type';
import type { Reagent } from '@/features/reagent/reagent.type';
import type { Vial } from '@/features/vial/vial.type';

export class AppDatabase extends Dexie {
  controlAgencies!: Table<ControlAgency, ControlAgency['id']>;
  fundingSources!: Table<FundingSource, FundingSource['id']>;
  laboratories!: Table<Laboratory, Laboratory['id']>;
  packages!: Table<Package, Package['id']>;
  reagents!: Table<Reagent, Reagent['id']>;
  suppliers!: Table<Supplier, Supplier['id']>;
  vials!: Table<Vial, Vial['id']>;

  constructor() {
    super('reagen-reloaded');

    this.version(1).stores({
      controlAgencies: '&id, name, deletedAt',
      fundingSources: '&id, name, deletedAt',
      laboratories: '&id, name, deletedAt',
      suppliers: '&id, name, deletedAt',
      reagents: '&id, name, controlAgencyId, deletedAt',
      packages: '&id, reagentId, fundingSourceId, supplierId, deletedAt',
      vials: '&id, packageId, laboratoryId, deletedAt',
    });
  }
}

export const appDatabase = new AppDatabase();
