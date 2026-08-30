import { describe, expect, it } from 'vitest';
import type { Entity, Id } from '@/database/persistence.types';
import { InMemoryRepository } from '@/test-utils/in-memory.repository';
import { NamedOptionService } from './named-option.service';

type TestOption = Entity<Id<'TestOption'>> & { name: string };

describe('NamedOptionService', () => {
  it('normalizes and sorts active options by name', async () => {
    const service = new NamedOptionService(new InMemoryRepository<TestOption>());

    await service.create('  Zeta  ');
    await service.create('Água   destilada');

    await expect(service.getAll()).resolves.toMatchObject([
      { name: 'Água destilada' },
      { name: 'Zeta' },
    ]);
  });

  it('rejects duplicate names after normalization', async () => {
    const service = new NamedOptionService(new InMemoryRepository<TestOption>());

    await service.create('Laboratório Central');

    await expect(service.create(' laboratório   central ')).rejects.toThrow(
      'Já existe uma opção com este nome.',
    );
  });

  it('allows a name to be reused after its option is removed', async () => {
    const repository = new InMemoryRepository<TestOption>();
    const service = new NamedOptionService(repository);
    const option = await service.create('Laboratório Central');

    await repository.remove(option.id);

    await expect(service.create(' laboratório   central ')).resolves.toMatchObject({
      name: 'laboratório central',
    });
  });
});
