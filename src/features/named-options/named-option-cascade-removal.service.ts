import type {
  AcquirerId,
  ControlAgencyId,
  LaboratoryId,
  SupplierId,
} from '@/features/named-options/options.type';
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

export type NamedOptionRemovalTarget =
  | { kind: 'control-agency'; id: ControlAgencyId }
  | { kind: 'acquirer'; id: AcquirerId }
  | { kind: 'laboratory'; id: LaboratoryId }
  | { kind: 'supplier'; id: SupplierId };

export type TransactionRunner = <T>(operation: () => Promise<T>) => Promise<T>;

type RemovalPlan = {
  impact: CascadeRemovalImpact;
  reagentIds: ReadonlySet<ReagentId>;
  packageIds: ReadonlySet<PackageId>;
  vialIds: ReadonlySet<VialId>;
  removeOption: () => Promise<boolean>;
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
    const plan = await this.buildPlan(target);
    return plan?.impact ?? null;
  }

  async remove(target: NamedOptionRemovalTarget): Promise<CascadeRemovalImpact | null> {
    return this.removePlan(() => this.buildPlan(target));
  }

  private async removePlan(
    buildPlan: () => Promise<RemovalPlan | null>,
  ): Promise<CascadeRemovalImpact | null> {
    return this.runInTransaction(async () => {
      const plan = await buildPlan();
      if (!plan) return null;

      for (const vialId of plan.vialIds) await this.vialService.remove(vialId);
      for (const packageId of plan.packageIds) await this.packageService.remove(packageId);
      for (const reagentId of plan.reagentIds) await this.reagentService.remove(reagentId);

      await plan.removeOption();

      return plan.impact;
    });
  }

  private buildPlan(target: NamedOptionRemovalTarget): Promise<RemovalPlan | null> {
    switch (target.kind) {
      case 'control-agency':
        return this.buildControlAgencyPlan(target.id);
      case 'acquirer':
        return this.buildAcquirerPlan(target.id);
      case 'laboratory':
        return this.buildLaboratoryPlan(target.id);
      case 'supplier':
        return this.buildSupplierPlan(target.id);
    }
  }

  private async buildControlAgencyPlan(id: ControlAgencyId): Promise<RemovalPlan | null> {
    if (!(await this.controlAgencyService.get(id))) return null;

    const reagents = await this.reagentService.findByControlAgencyId(id);
    const reagentIds = new Set(reagents.map((reagent) => reagent.id));
    const packages = await this.packageService.findByReagentIds(reagentIds);
    const packageIds = new Set(packages.map((item) => item.id));
    const vials = await this.vialService.findByPackageIds(packageIds);

    return this.createPlan(reagentIds, packageIds, new Set(vials.map((item) => item.id)), () =>
      this.controlAgencyService.remove(id),
    );
  }

  private async buildAcquirerPlan(id: AcquirerId): Promise<RemovalPlan | null> {
    if (!(await this.acquirerService.get(id))) return null;

    const packages = await this.packageService.findByAcquirerId(id);
    const packageIds = new Set(packages.map((item) => item.id));
    const vials = await this.vialService.findByPackageIds(packageIds);

    return this.createPlan(new Set(), packageIds, new Set(vials.map((item) => item.id)), () =>
      this.acquirerService.remove(id),
    );
  }

  private async buildLaboratoryPlan(id: LaboratoryId): Promise<RemovalPlan | null> {
    if (!(await this.laboratoryService.get(id))) return null;

    const vials = await this.vialService.findByLaboratoryId(id);
    const vialIds = new Set(vials.map((item) => item.id));

    return this.createPlan(new Set(), new Set(), vialIds, () => this.laboratoryService.remove(id));
  }

  private async buildSupplierPlan(id: SupplierId): Promise<RemovalPlan | null> {
    if (!(await this.supplierService.get(id))) return null;

    const packages = await this.packageService.findBySupplierId(id);
    const packageIds = new Set(packages.map((item) => item.id));
    const vials = await this.vialService.findByPackageIds(packageIds);

    return this.createPlan(new Set(), packageIds, new Set(vials.map((item) => item.id)), () =>
      this.supplierService.remove(id),
    );
  }

  private createPlan(
    reagentIds: ReadonlySet<ReagentId>,
    packageIds: ReadonlySet<PackageId>,
    vialIds: ReadonlySet<VialId>,
    removeOption: () => Promise<boolean>,
  ): RemovalPlan {
    return {
      reagentIds,
      packageIds,
      vialIds,
      removeOption,
      impact: { reagents: reagentIds.size, packages: packageIds.size, vials: vialIds.size },
    };
  }

}
