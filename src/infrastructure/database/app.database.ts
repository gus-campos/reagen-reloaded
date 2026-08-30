import Dexie, { type Table } from 'dexie';
import type { Acquirer, ControlAgency, Laboratory, Supplier } from '@/features/named-options/options.type';
import type { Package } from '@/features/package/package.type';
import type { Reagent } from '@/features/reagent/reagent.type';
import type { Vial } from '@/features/vial/vial.type';

export class AppDatabase extends Dexie {
  acquirers!: Table<Acquirer, Acquirer['id']>;
  controlAgencies!: Table<ControlAgency, ControlAgency['id']>;
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

    this.version(2)
      .stores({
        acquirers: '&id, name, deletedAt',
        packages: '&id, reagentId, acquirerId, supplierId, deletedAt',
      })
      .upgrade(async (transaction) => {
        const legacyAcquirers = await transaction.table('fundingSources').toArray();
        await transaction.table('acquirers').bulkPut(legacyAcquirers);
        await transaction.table('packages').toCollection().modify((item) => {
          const legacyPackage = item as { acquirerId?: unknown; fundingSourceId?: unknown };
          legacyPackage.acquirerId = legacyPackage.fundingSourceId ?? null;
          delete legacyPackage.fundingSourceId;
        });
      });

    this.version(3).stores({ fundingSources: null });
  }
}

export const appDatabase = new AppDatabase();
