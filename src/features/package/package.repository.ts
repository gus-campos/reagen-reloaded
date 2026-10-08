import type { AcquirerId, SupplierId } from '@/features/named-options/options.type';
import type { Package } from '@/features/package/package.type';
import type { ReagentId } from '@/features/reagent/reagent.type';
import type { Repository } from '@/infrastructure/database/repository';

export interface PackageRepository extends Repository<Package> {
  findByAcquirerId(id: AcquirerId): Promise<Package[]>;
  findByReagentIds(ids: ReadonlySet<ReagentId>): Promise<Package[]>;
  findBySupplierId(id: SupplierId): Promise<Package[]>;
}
