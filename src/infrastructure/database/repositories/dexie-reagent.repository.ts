import type { ControlAgencyId } from '@/features/named-options/options.type';
import type { ReagentRepository } from '@/features/reagent/reagent.repository';
import type { Reagent } from '@/features/reagent/reagent.type';
import { DexieRepository } from '@/infrastructure/database/repositories/dexie.repository';

export class DexieReagentRepository extends DexieRepository<Reagent> implements ReagentRepository {
  findByControlAgencyId(id: ControlAgencyId): Promise<Reagent[]> {
    return this.table
      .where('controlAgencyId')
      .equals(id)
      .filter((item) => item.deletedAt === null)
      .toArray();
  }
}
