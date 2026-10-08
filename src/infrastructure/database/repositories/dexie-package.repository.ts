import type { AcquirerId, SupplierId } from '@/features/named-options/options.type';
import type { PackageRepository } from '@/features/package/package.repository';
import type { Package } from '@/features/package/package.type';
import type { ReagentId } from '@/features/reagent/reagent.type';
import { DexieRepository } from '@/infrastructure/database/repositories/dexie.repository';

export class DexiePackageRepository extends DexieRepository<Package> implements PackageRepository {
  findByAcquirerId(id: AcquirerId): Promise<Package[]> {
    return this.table.where('acquirerId').equals(id).filter((item) => item.deletedAt === null).toArray();
  }

  findByReagentIds(ids: ReadonlySet<ReagentId>): Promise<Package[]> {
    if (ids.size === 0) return Promise.resolve([]);

    return this.table.where('reagentId').anyOf([...ids]).filter((item) => item.deletedAt === null).toArray();
  }

  findBySupplierId(id: SupplierId): Promise<Package[]> {
    return this.table.where('supplierId').equals(id).filter((item) => item.deletedAt === null).toArray();
  }
}
