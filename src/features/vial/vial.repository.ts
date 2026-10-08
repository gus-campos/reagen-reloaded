import type { LaboratoryId } from '@/features/named-options/options.type';
import type { PackageId } from '@/features/package/package.type';
import type { Repository } from '@/infrastructure/database/repository';
import type { Vial } from '@/features/vial/vial.type';

export interface VialRepository extends Repository<Vial> {
  findByLaboratoryId(id: LaboratoryId): Promise<Vial[]>;
  findByPackageIds(ids: ReadonlySet<PackageId>): Promise<Vial[]>;
}
