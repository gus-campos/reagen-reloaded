import { EntityService } from '@/shared/services/entity.service';
import type { AcquirerId, SupplierId } from '@/features/named-options/options.type';
import type { PackageRepository } from '@/features/package/package.repository';
import type { Package } from '@/features/package/package.type';
import type { ReagentId } from '@/features/reagent/reagent.type';

export class PackageService extends EntityService<Package> {
  constructor(private readonly packageRepository: PackageRepository) {
    super(packageRepository);
  }

  findByAcquirerId(id: AcquirerId): Promise<Package[]> {
    return this.packageRepository.findByAcquirerId(id);
  }

  findByReagentIds(ids: ReadonlySet<ReagentId>): Promise<Package[]> {
    return this.packageRepository.findByReagentIds(ids);
  }

  findBySupplierId(id: SupplierId): Promise<Package[]> {
    return this.packageRepository.findBySupplierId(id);
  }
}
