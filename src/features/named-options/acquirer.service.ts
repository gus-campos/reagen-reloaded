import type { CascadeRemovalResult } from '@/features/named-options/cascade-removal.type';
import { NamedOptionService } from '@/features/named-options/named-option.service';
import type { Acquirer, AcquirerId } from '@/features/named-options/options.type';

export class AcquirerService extends NamedOptionService<Acquirer> {
  // Leva as embalagens adquiridas por ele, com seus frascos.
  async planRemoval(id: AcquirerId): Promise<CascadeRemovalResult | null> {
    if (!(await this.get(id))) return null;

    const { packageService, vialService } = this.cascadeRemovalDependencies;
    const packages = await packageService.findByAcquirerId(id);
    const packageIds = new Set(packages.map((item) => item.id));
    const vials = await vialService.findByPackageIds(packageIds);

    return this.createRemovalPlan({ packageIds, vialIds: new Set(vials.map((item) => item.id)) });
  }
}
