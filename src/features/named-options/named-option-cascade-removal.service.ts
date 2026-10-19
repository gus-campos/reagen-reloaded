import type {
  AcquirerId,
  ControlAgencyId,
  LaboratoryId,
  SupplierId,
} from '@/features/named-options/options.type';
import type {
  NamedOptionByKind,
  NamedOptionKind,
} from '@/features/named-options/named-option-kind';
import type { PackageId } from '@/features/package/package.type';
import { PackageService } from '@/features/package/package.service';
import type { ReagentId } from '@/features/reagent/reagent.type';
import { ReagentService } from '@/features/reagent/reagent.service';
import type { VialId } from '@/features/vial/vial.type';
import { VialService } from '@/features/vial/vial.service';
import { NamedOptionService } from '@/features/named-options/named-option.service';
import type {
  Acquirer,
  ControlAgency,
  Laboratory,
  Supplier,
} from '@/features/named-options/options.type';

export type CascadeRemovalImpact = {
  reagents: number;
  packages: number;
  vials: number;
};

export type NamedOptionRemovalTarget = {
  [K in NamedOptionKind]: { kind: K; id: NamedOptionByKind[K]['id'] };
}[NamedOptionKind];

export type TransactionRunner = <T>(operation: () => Promise<T>) => Promise<T>;

export type CascadeRemovalResult = {
  impact: CascadeRemovalImpact;
  reagentIds: ReadonlySet<ReagentId>;
  packageIds: ReadonlySet<PackageId>;
  vialIds: ReadonlySet<VialId>;
};

export class NamedOptionCascadeRemovalService {
  constructor(
    private readonly runInTransaction: TransactionRunner,
    private readonly controlAgencyService: NamedOptionService<ControlAgency>,
    private readonly acquirerService: NamedOptionService<Acquirer>,
    private readonly laboratoryService: NamedOptionService<Laboratory>,
    private readonly supplierService: NamedOptionService<Supplier>,
    private readonly reagentService: ReagentService,
    private readonly packageService: PackageService,
    private readonly vialService: VialService,
  ) {}

  async preview(target: NamedOptionRemovalTarget): Promise<CascadeRemovalImpact | null> {
    const plan = await this.plan(target);
    return plan?.impact ?? null;
  }

  // O plano é refeito dentro da transação para refletir o estado atual, não o do preview.
  async remove(target: NamedOptionRemovalTarget): Promise<CascadeRemovalResult | null> {
    return this.runInTransaction(async () => {
      const plan = await this.plan(target);
      if (!plan) return null;

      const { vialIds, packageIds, reagentIds } = plan;
      for (const vialId of vialIds) await this.vialService.remove(vialId);
      for (const packageId of packageIds) await this.packageService.remove(packageId);
      for (const reagentId of reagentIds) await this.reagentService.remove(reagentId);

      await this.removeOption(target);

      return plan;
    });
  }

  private plan(target: NamedOptionRemovalTarget): Promise<CascadeRemovalResult | null> {
    switch (target.kind) {
      case 'control-agency':
        return this.planControlAgency(target.id);
      case 'acquirer':
        return this.planAcquirer(target.id);
      case 'laboratory':
        return this.planLaboratory(target.id);
      case 'supplier':
        return this.planSupplier(target.id);
    }
  }

  private removeOption(target: NamedOptionRemovalTarget): Promise<boolean> {
    switch (target.kind) {
      case 'control-agency':
        return this.controlAgencyService.remove(target.id);
      case 'acquirer':
        return this.acquirerService.remove(target.id);
      case 'laboratory':
        return this.laboratoryService.remove(target.id);
      case 'supplier':
        return this.supplierService.remove(target.id);
    }
  }

  private async planControlAgency(id: ControlAgencyId): Promise<CascadeRemovalResult | null> {
    if (!(await this.controlAgencyService.get(id))) return null;

    const reagents = await this.reagentService.findByControlAgencyId(id);
    const reagentIds = new Set(reagents.map((reagent) => reagent.id));
    const packages = await this.packageService.findByReagentIds(reagentIds);
    const packageIds = new Set(packages.map((item) => item.id));
    const vials = await this.vialService.findByPackageIds(packageIds);

    return this.createResult(reagentIds, packageIds, new Set(vials.map((item) => item.id)));
  }

  private async planAcquirer(id: AcquirerId): Promise<CascadeRemovalResult | null> {
    if (!(await this.acquirerService.get(id))) return null;

    const packages = await this.packageService.findByAcquirerId(id);
    const packageIds = new Set(packages.map((item) => item.id));
    const vials = await this.vialService.findByPackageIds(packageIds);

    return this.createResult(new Set(), packageIds, new Set(vials.map((item) => item.id)));
  }

  private async planLaboratory(id: LaboratoryId): Promise<CascadeRemovalResult | null> {
    if (!(await this.laboratoryService.get(id))) return null;

    const vials = await this.vialService.findByLaboratoryId(id);

    return this.createResult(new Set(), new Set(), new Set(vials.map((item) => item.id)));
  }

  private async planSupplier(id: SupplierId): Promise<CascadeRemovalResult | null> {
    if (!(await this.supplierService.get(id))) return null;

    const packages = await this.packageService.findBySupplierId(id);
    const packageIds = new Set(packages.map((item) => item.id));
    const vials = await this.vialService.findByPackageIds(packageIds);

    return this.createResult(new Set(), packageIds, new Set(vials.map((item) => item.id)));
  }

  private createResult(
    reagentIds: ReadonlySet<ReagentId>,
    packageIds: ReadonlySet<PackageId>,
    vialIds: ReadonlySet<VialId>,
  ): CascadeRemovalResult {
    return {
      reagentIds,
      packageIds,
      vialIds,
      impact: { reagents: reagentIds.size, packages: packageIds.size, vials: vialIds.size },
    };
  }
}
