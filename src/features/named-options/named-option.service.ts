import type { Id } from '@/infrastructure/database/persistence.types';
import type { CreationDto, Repository, UpdateDto } from '@/infrastructure/database/repository';
import type {
  CascadeRemovalDependencies,
  CascadeRemovalImpact,
  CascadeRemovalResult,
} from '@/features/named-options/cascade-removal.type';
import type { NamedOption } from '@/features/named-options/named-option.type';
import type { PackageId } from '@/features/package/package.type';
import type { ReagentId } from '@/features/reagent/reagent.type';
import type { VialId } from '@/features/vial/vial.type';
import { EntityService } from '@/shared/services/entity.service';

type RemovalPlanIds = {
  reagentIds?: ReadonlySet<ReagentId>;
  packageIds?: ReadonlySet<PackageId>;
  vialIds?: ReadonlySet<VialId>;
};

export abstract class NamedOptionService<
  TEntity extends NamedOption<Id<string>>,
> extends EntityService<TEntity> {
  constructor(
    repository: Repository<TEntity>,
    protected readonly cascadeRemovalDependencies: CascadeRemovalDependencies,
  ) {
    super(repository);
  }

  // Lista os registros que seriam removidos junto com a opção; null se ela não existir.
  abstract planRemoval(id: TEntity['id']): Promise<CascadeRemovalResult | null>;

  create(name: string): Promise<TEntity>;
  create(dto: CreationDto<TEntity>): Promise<TEntity>;
  async create(input: string | CreationDto<TEntity>): Promise<TEntity> {
    const normalizedName = this.normalizeName(typeof input === 'string' ? input : input.name);
    const options = await super.getAll();
    if (
      options.some(
        (option) => this.comparisonName(option.name) === this.comparisonName(normalizedName),
      )
    ) {
      throw new Error('Já existe uma opção com este nome.');
    }
    return super.create({ name: normalizedName } as CreationDto<TEntity>);
  }

  async getAll(): Promise<TEntity[]> {
    return [...(await super.getAll())].sort((first, second) =>
      first.name.localeCompare(second.name, 'pt-BR'),
    );
  }

  async update(id: TEntity['id'], dto: UpdateDto<TEntity>): Promise<TEntity | null> {
    const option = await super.get(id);
    if (!option) return null;
    if (dto.name === undefined) return super.update(id, dto);

    const normalizedName = this.normalizeName(dto.name);
    const options = await super.getAll();
    if (
      options.some(
        (candidate) =>
          candidate.id !== id &&
          this.comparisonName(candidate.name) === this.comparisonName(normalizedName),
      )
    ) {
      throw new Error('Já existe uma opção com este nome.');
    }
    return super.update(id, { ...dto, name: normalizedName });
  }

  async previewRemoval(id: TEntity['id']): Promise<CascadeRemovalImpact | null> {
    const plan = await this.planRemoval(id);
    return plan?.impact ?? null;
  }

  // Contrato herdado, mas sempre com a cascata: nenhum caminho público remove sem ela.
  async remove(id: TEntity['id']): Promise<boolean> {
    return (await this.removeWithCascade(id)) !== null;
  }

  // Mesma remoção do `remove`, devolvendo também o que foi removido junto.
  // O plano é refeito dentro da transação para refletir o estado atual, não o do preview.
  removeWithCascade(id: TEntity['id']): Promise<CascadeRemovalResult | null> {
    const { runInTransaction, reagentService, packageService, vialService } =
      this.cascadeRemovalDependencies;

    return runInTransaction(async () => {
      const plan = await this.planRemoval(id);
      if (!plan) return null;

      const { vialIds, packageIds, reagentIds } = plan;
      for (const vialId of vialIds) await vialService.remove(vialId);
      for (const packageId of packageIds) await packageService.remove(packageId);
      for (const reagentId of reagentIds) await reagentService.remove(reagentId);

      // `super`, pois `this.remove` entraria na cascata de novo.
      await super.remove(id);

      return plan;
    });
  }

  protected createRemovalPlan(ids: RemovalPlanIds): CascadeRemovalResult {
    const { reagentIds = new Set(), packageIds = new Set(), vialIds = new Set() } = ids;
    return {
      reagentIds,
      packageIds,
      vialIds,
      impact: { reagents: reagentIds.size, packages: packageIds.size, vials: vialIds.size },
    };
  }

  private normalizeName(name: string): string {
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    if (!normalizedName) throw new Error('Informe um nome.');
    return normalizedName;
  }

  private comparisonName(name: string): string {
    return this.normalizeName(name).toLocaleLowerCase('pt-BR');
  }
}
