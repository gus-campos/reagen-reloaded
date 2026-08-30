import type { Id } from '@/database/persistence.types';
import type { CreationDto, Repository, UpdateDto } from '@/database/repository';
import { EntityService } from '@/features/shared/entity.service';
import type { NamedOption } from './named-option.type';

export class NamedOptionService<TEntity extends NamedOption<Id<string>>> extends EntityService<TEntity> {
  constructor(repository: Repository<TEntity>) {
    super(repository);
  }

  create(name: string): Promise<TEntity>;
  create(dto: CreationDto<TEntity>): Promise<TEntity>;
  async create(input: string | CreationDto<TEntity>): Promise<TEntity> {
    const normalizedName = this.normalizeName(typeof input === 'string' ? input : input.name);
    const options = await super.getAll();

    if (options.some((option) => this.comparisonName(option.name) === this.comparisonName(normalizedName))) {
      throw new Error('Já existe uma opção com este nome.');
    }

    return super.create({ name: normalizedName } as CreationDto<TEntity>);
  }

  async getAll(): Promise<TEntity[]> {
    const options = await super.getAll();

    return [...options].sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
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

  private normalizeName(name: string): string {
    const normalizedName = name.trim().replaceAll(/\s+/g, ' ');

    if (!normalizedName) throw new Error('Informe um nome.');

    return normalizedName;
  }

  private comparisonName(name: string): string {
    return this.normalizeName(name).toLocaleLowerCase('pt-BR');
  }
}
