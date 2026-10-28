import type { CascadeRemovalResult } from '@/features/named-options/cascade-removal.type';
import { NamedOptionService } from '@/features/named-options/named-option.service';
import type { ControlAgency, ControlAgencyId } from '@/features/named-options/options.type';

export class ControlAgencyService extends NamedOptionService<ControlAgency> {
  // Leva os reagentes controlados pelo órgão, com suas embalagens e frascos.
  async planRemoval(id: ControlAgencyId): Promise<CascadeRemovalResult | null> {
    if (!(await this.get(id))) return null;

    const { reagentService, packageService, vialService } = this.cascadeRemovalDependencies;
    const reagents = await reagentService.findByControlAgencyId(id);
    const reagentIds = new Set(reagents.map((item) => item.id));
    const packages = await packageService.findByReagentIds(reagentIds);
    const packageIds = new Set(packages.map((item) => item.id));
    const vials = await vialService.findByPackageIds(packageIds);

    return this.createRemovalPlan({
      reagentIds,
      packageIds,
      vialIds: new Set(vials.map((item) => item.id)),
    });
  }
}
