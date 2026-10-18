import type { LaboratoryId } from '@/features/named-options/options.type';
import type { PackageId } from '@/features/package/package.type';
import type { VialRepository } from '@/features/vial/vial.repository';
import type { Vial } from '@/features/vial/vial.type';
import { DexieRepository } from '@/infrastructure/database/repositories/dexie.repository';

export class DexieVialRepository extends DexieRepository<Vial> implements VialRepository {
  findByLaboratoryId(id: LaboratoryId): Promise<Vial[]> {
    return this.table
      .where('laboratoryId')
      .equals(id)
      .filter((item) => item.deletedAt === null)
      .toArray();
  }

  findByPackageIds(ids: ReadonlySet<PackageId>): Promise<Vial[]> {
    if (ids.size === 0) return Promise.resolve([]);

    return this.table
      .where('packageId')
      .anyOf([...ids])
      .filter((item) => item.deletedAt === null)
      .toArray();
  }
}
