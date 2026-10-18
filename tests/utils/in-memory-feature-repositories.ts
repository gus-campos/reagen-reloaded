import type { Dayjs } from 'dayjs';
import type {
  AcquirerId,
  ControlAgencyId,
  LaboratoryId,
  SupplierId,
} from '@/features/named-options/options.type';
import type { PackageRepository } from '@/features/package/package.repository';
import type { Package, PackageId } from '@/features/package/package.type';
import type { ReagentRepository } from '@/features/reagent/reagent.repository';
import type { Reagent, ReagentId } from '@/features/reagent/reagent.type';
import type { VialRepository } from '@/features/vial/vial.repository';
import type { Vial } from '@/features/vial/vial.type';
import { InMemoryRepository } from '@tests/utils/in-memory.repository';

export class InMemoryReagentRepository
  extends InMemoryRepository<Reagent>
  implements ReagentRepository
{
  constructor(generateId: () => ReagentId, now: () => Dayjs) {
    super(generateId, now);
  }

  async findByControlAgencyId(id: ControlAgencyId): Promise<Reagent[]> {
    return (await this.getAll()).filter((item) => item.controlAgencyId === id);
  }
}

export class InMemoryPackageRepository
  extends InMemoryRepository<Package>
  implements PackageRepository
{
  constructor(generateId: () => PackageId, now: () => Dayjs) {
    super(generateId, now);
  }

  async findByAcquirerId(id: AcquirerId): Promise<Package[]> {
    return (await this.getAll()).filter((item) => item.acquirerId === id);
  }

  async findByReagentIds(ids: ReadonlySet<ReagentId>): Promise<Package[]> {
    return (await this.getAll()).filter((item) => ids.has(item.reagentId));
  }

  async findBySupplierId(id: SupplierId): Promise<Package[]> {
    return (await this.getAll()).filter((item) => item.supplierId === id);
  }
}

export class InMemoryVialRepository extends InMemoryRepository<Vial> implements VialRepository {
  constructor(generateId: () => Vial['id'], now: () => Dayjs) {
    super(generateId, now);
  }

  async findByLaboratoryId(id: LaboratoryId): Promise<Vial[]> {
    return (await this.getAll()).filter((item) => item.laboratoryId === id);
  }

  async findByPackageIds(ids: ReadonlySet<PackageId>): Promise<Vial[]> {
    return (await this.getAll()).filter((item) => ids.has(item.packageId));
  }
}
