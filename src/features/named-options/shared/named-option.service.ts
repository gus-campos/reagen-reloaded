import type { Id } from '@/database/persistence.types';
import type { CreationDto, Repository } from '@/database/repository';
import type { NamedOption } from './named-option.type';

export class NamedOptionService<TEntity extends NamedOption<Id<string>>> {
  constructor(private readonly repository: Repository<TEntity>) {}

  async create(name: string): Promise<TEntity> {
    const normalizedName = this.normalizeName(name);
    const options = await this.repository.getAll({ getDeleted: true });

    if (options.some((option) => this.normalizeName(option.name) === normalizedName)) {
      throw new Error('Já existe uma opção com este nome.');
    }

    return this.repository.create({ name: normalizedName } as CreationDto<TEntity>);
  }

  async getAll(): Promise<TEntity[]> {
    const options = await this.repository.getAll();

    return [...options].sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
  }

  private normalizeName(name: string): string {
    const normalizedName = name.trim().replaceAll(/\s+/g, ' ');

    if (!normalizedName) throw new Error('Informe um nome.');

    return normalizedName;
  }
}
