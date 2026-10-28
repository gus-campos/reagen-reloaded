import type { CascadeRemovalResult } from '@/features/named-options/cascade-removal.type';
import { NamedOptionService } from '@/features/named-options/named-option.service';
import type { Supplier, SupplierId } from '@/features/named-options/options.type';

export class SupplierService extends NamedOptionService<Supplier> {
  // Leva as embalagens fornecidas por ele, com seus frascos.
  async planRemoval(id: SupplierId): Promise<CascadeRemovalResult | null> {
    if (!(await this.get(id))) return null;

    const { packageService, vialService } = this.cascadeRemovalDependencies;
    const packages = await packageService.findBySupplierId(id);
    const packageIds = new Set(packages.map((item) => item.id));
    const vials = await vialService.findByPackageIds(packageIds);

    return this.createRemovalPlan({ packageIds, vialIds: new Set(vials.map((item) => item.id)) });
  }
}
