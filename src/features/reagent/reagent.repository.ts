import type { ControlAgencyId } from '@/features/named-options/options.type';
import type { Reagent } from '@/features/reagent/reagent.type';
import type { Repository } from '@/infrastructure/database/repository';

export interface ReagentRepository extends Repository<Reagent> {
  findByControlAgencyId(id: ControlAgencyId): Promise<Reagent[]>;
}
