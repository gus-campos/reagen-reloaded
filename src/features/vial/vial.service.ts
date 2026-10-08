import { EntityService } from '@/shared/services/entity.service';
import type { LaboratoryId } from '@/features/named-options/options.type';
import type { PackageId } from '@/features/package/package.type';
import type { VialRepository } from '@/features/vial/vial.repository';
import type { Vial } from '@/features/vial/vial.type';

export class VialService extends EntityService<Vial> {
  constructor(private readonly vialRepository: VialRepository) {
    super(vialRepository);
  }

  findByLaboratoryId(id: LaboratoryId): Promise<Vial[]> {
    return this.vialRepository.findByLaboratoryId(id);
  }

  findByPackageIds(ids: ReadonlySet<PackageId>): Promise<Vial[]> {
    return this.vialRepository.findByPackageIds(ids);
  }
}
