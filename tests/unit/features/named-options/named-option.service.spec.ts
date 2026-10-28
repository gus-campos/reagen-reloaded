import { describe, expect, it } from 'vitest';
import { generateId, now } from '@/infrastructure/database/persistence.dependencies';
import type { Entity, Id } from '@/infrastructure/database/persistence.types';
import type { CascadeRemovalResult } from '@/features/named-options/cascade-removal.type';
import { NamedOptionService } from '@/features/named-options/named-option.service';
import type { Repository } from '@/infrastructure/database/repository';
import { createInMemoryCascadeRemoval } from '@tests/unit/features/named-options/named-option.test-utils';
import { InMemoryRepository } from '@tests/utils/in-memory.repository';

type TestOption = Entity<Id<'TestOption'>> & { name: string };

// A base é abstrata; esta opção de teste não tem dependentes a remover.
class TestOptionService extends NamedOptionService<TestOption> {
  constructor(repository: Repository<TestOption>) {
    super(repository, createInMemoryCascadeRemoval().dependencies);
  }

  async planRemoval(id: TestOption['id']): Promise<CascadeRemovalResult | null> {
    return (await this.get(id)) ? this.createRemovalPlan({}) : null;
  }
}

describe('NamedOptionService', () => {
  it('normalizes and sorts active options by name', async () => {
    const service = new TestOptionService(new InMemoryRepository<TestOption>(generateId, now));
    await service.create('  Zeta  ');
    await service.create('Água   destilada');

    await expect(service.getAll()).resolves.toMatchObject([
      { name: 'Água destilada' },
      { name: 'Zeta' },
    ]);
  });

  it('rejects duplicate names after normalization', async () => {
    const service = new TestOptionService(new InMemoryRepository<TestOption>(generateId, now));
    await service.create('Laboratório Central');

    await expect(service.create(' laboratório   central ')).rejects.toThrow(
      'Já existe uma opção com este nome.',
    );
  });

  it('allows a name to be reused after its option is removed', async () => {
    const repository = new InMemoryRepository<TestOption>(generateId, now);
    const service = new TestOptionService(repository);
    const option = await service.create('Laboratório Central');
    await repository.remove(option.id);

    await expect(service.create(' laboratório   central ')).resolves.toMatchObject({
      name: 'laboratório central',
    });
  });

  it('normalizes updates and rejects a name already used by another active option', async () => {
    const service = new TestOptionService(new InMemoryRepository<TestOption>(generateId, now));
    const first = await service.create('Laboratório Central');
    const second = await service.create('Laboratório de Química');

    await expect(service.update(second.id, { name: '  laboratório central ' })).rejects.toThrow(
      'Já existe uma opção com este nome.',
    );
    await expect(
      service.update(first.id, { name: ' Laboratório   Principal ' }),
    ).resolves.toMatchObject({
      name: 'Laboratório Principal',
    });
  });
});
