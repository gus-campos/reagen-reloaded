import { EntityService } from '@/shared/services/entity.service';
import type { ControlAgencyId } from '@/features/named-options/options.type';
import type { ReagentRepository } from '@/features/reagent/reagent.repository';
import type { Reagent } from '@/features/reagent/reagent.type';

export class ReagentService extends EntityService<Reagent> {
  constructor(private readonly reagentRepository: ReagentRepository) {
    super(reagentRepository);
  }

  findByControlAgencyId(id: ControlAgencyId): Promise<Reagent[]> {
    return this.reagentRepository.findByControlAgencyId(id);
  }
}
