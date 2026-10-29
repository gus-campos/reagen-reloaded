import { EntityService } from '@/shared/services/entity.service';
import type {
  CascadeRemovalImpact,
  CascadeRemovalResult,
  TransactionRunner,
} from '@/features/named-options/cascade-removal.type';
import type { ControlAgencyId } from '@/features/named-options/options.type';
import type { PackageService } from '@/features/package/package.service';
import type { Package } from '@/features/package/package.type';
import type { ReagentRepository } from '@/features/reagent/reagent.repository';
import type { Reagent } from '@/features/reagent/reagent.type';
import type { VialService } from '@/features/vial/vial.service';
import type { UpdateDto } from '@/infrastructure/database/repository';
import { getSizeKey } from '@/shared/utils/get-size-key';

// O que a edição precisa para remover as embalagens (e frascos) dos tamanhos retirados.
export type ReagentUpdateDependencies = {
  runInTransaction: TransactionRunner;
  packageService: PackageService;
  vialService: VialService;
};

export type ReagentUpdateResult = {
  reagent: Reagent;
  removal: CascadeRemovalResult;
};

export class ReagentService extends EntityService<Reagent> {
  constructor(
    private readonly reagentRepository: ReagentRepository,
    private readonly cascadeRemovalDependencies: ReagentUpdateDependencies,
  ) {
    super(reagentRepository);
  }

  findByControlAgencyId(id: ControlAgencyId): Promise<Reagent[]> {
    return this.reagentRepository.findByControlAgencyId(id);
  }

  // Lista o que seria removido junto com a edição; null se o reagente não existir.
  async planUpdate(
    id: Reagent['id'],
    dto: UpdateDto<Reagent>,
  ): Promise<CascadeRemovalResult | null> {
    const reagent = await this.get(id);
    if (!reagent) return null;

    // A dimensão é fixada na criação: tamanhos e embalagens existentes dependem dela.
    if (dto.dimension !== undefined && dto.dimension !== reagent.dimension) {
      throw new Error('A dimensão do reagente não pode ser alterada.');
    }

    const removedSizeKeys = this.removedSizeKeys(reagent, dto);

    const packages = await this.findPackagesWithSizes(id, removedSizeKeys);
    const packageIds = new Set(packages.map((item) => item.id));

    const vials = await this.cascadeRemovalDependencies.vialService.findByPackageIds(packageIds);
    const vialIds = new Set(vials.map((item) => item.id));

    return {
      reagentIds: new Set(),
      packageIds,
      vialIds,
      impact: { reagents: 0, packages: packageIds.size, vials: vialIds.size },
    };
  }

  async previewUpdate(
    id: Reagent['id'],
    dto: UpdateDto<Reagent>,
  ): Promise<CascadeRemovalImpact | null> {
    const plan = await this.planUpdate(id, dto);
    return plan?.impact ?? null;
  }

  // Contrato herdado, mas sempre com a regra: nenhum caminho público edita sem ela.
  async update(id: Reagent['id'], dto: UpdateDto<Reagent>): Promise<Reagent | null> {
    const result = await this.updateWithCascade(id, dto);
    return result?.reagent ?? null;
  }

  // Mesma edição do `update`, devolvendo também o que foi removido junto.
  // O plano é refeito dentro da transação para refletir o estado atual, não o do preview.
  updateWithCascade(
    id: Reagent['id'],
    dto: UpdateDto<Reagent>,
  ): Promise<ReagentUpdateResult | null> {
    const { runInTransaction, packageService, vialService } = this.cascadeRemovalDependencies;

    return runInTransaction(async () => {
      const plan = await this.planUpdate(id, dto);
      if (!plan) return null;

      for (const vialId of plan.vialIds) await vialService.remove(vialId);
      for (const packageId of plan.packageIds) await packageService.remove(packageId);

      // `super`, pois `this.update` entraria na cascata de novo.
      const reagent = await super.update(id, dto);
      if (!reagent) return null;

      return { reagent, removal: plan };
    });
  }

  private removedSizeKeys(reagent: Reagent, dto: UpdateDto<Reagent>): Set<string> {
    if (!dto.sizes) return new Set();

    const keptKeys = new Set(dto.sizes.map(getSizeKey));
    return new Set(reagent.sizes.map(getSizeKey).filter((key) => !keptKeys.has(key)));
  }

  private async findPackagesWithSizes(
    id: Reagent['id'],
    sizeKeys: ReadonlySet<string>,
  ): Promise<Package[]> {
    if (sizeKeys.size === 0) return [];

    const packages = await this.cascadeRemovalDependencies.packageService.findByReagentIds(new Set([id]));
    return packages.filter((item) => sizeKeys.has(getSizeKey(item.size)));
  }
}
