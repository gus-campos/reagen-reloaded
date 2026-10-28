import type { CascadeRemovalResult } from '@/features/named-options/cascade-removal.type';
import { NamedOptionService } from '@/features/named-options/named-option.service';
import type { Laboratory, LaboratoryId } from '@/features/named-options/options.type';

export class LaboratoryService extends NamedOptionService<Laboratory> {
  // Leva apenas os frascos alocados no laboratório.
  async planRemoval(id: LaboratoryId): Promise<CascadeRemovalResult | null> {
    if (!(await this.get(id))) return null;

    const vials = await this.cascadeRemovalDependencies.vialService.findByLaboratoryId(id);

    return this.createRemovalPlan({ vialIds: new Set(vials.map((item) => item.id)) });
  }
}
