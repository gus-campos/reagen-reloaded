import type { PackageService } from '@/features/package/package.service';
import type { PackageId } from '@/features/package/package.type';
import type { ReagentService } from '@/features/reagent/reagent.service';
import type { ReagentId } from '@/features/reagent/reagent.type';
import type { VialService } from '@/features/vial/vial.service';
import type { VialId } from '@/features/vial/vial.type';

export type CascadeRemovalImpact = {
  reagents: number;
  packages: number;
  vials: number;
};

export type CascadeRemovalResult = {
  impact: CascadeRemovalImpact;
  reagentIds: ReadonlySet<ReagentId>;
  packageIds: ReadonlySet<PackageId>;
  vialIds: ReadonlySet<VialId>;
};

export type TransactionRunner = <T>(operation: () => Promise<T>) => Promise<T>;

// O que uma opção nomeada precisa para remover, junto com ela, os registros que dependem dela.
export type CascadeRemovalDependencies = {
  runInTransaction: TransactionRunner;
  reagentService: ReagentService;
  packageService: PackageService;
  vialService: VialService;
};
