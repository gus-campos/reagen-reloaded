import { describe, expect, it } from 'vitest';
import { generateId, now } from '@/database/persistence.dependencies';
import type { Entity, Id } from '@/database/persistence.types';
import { InMemoryRepository } from '@/test-utils/in-memory.repository';
import { NamedOptionService } from '@/features/named-options/shared/named-option.service';

type TestOption = Entity<Id<'TestOption'>> & { name: string };

describe('NamedOptionService', () => {
  it('normalizes and sorts active options by name', async () => {
    const service = new NamedOptionService(new InMemoryRepository<TestOption>(generateId, now));

    await service.create('  Zeta  ');
    await service.create('Água   destilada');

    await expect(service.getAll()).resolves.toMatchObject([
      { name: 'Água destilada' },
      { name: 'Zeta' },
    ]);
  });

  it('rejects duplicate names after normalization', async () => {
    const service = new NamedOptionService(new InMemoryRepository<TestOption>(generateId, now));

    await service.create('Laboratório Central');

    await expect(service.create(' laboratório   central ')).rejects.toThrow(
      'Já existe uma opção com este nome.',
    );
  });

  it('allows a name to be reused after its option is removed', async () => {
    const repository = new InMemoryRepository<TestOption>(generateId, now);
    const service = new NamedOptionService(repository);
    const option = await service.create('Laboratório Central');

    await repository.remove(option.id);

    await expect(service.create(' laboratório   central ')).resolves.toMatchObject({
      name: 'laboratório central',
    });
  });

  it('normalizes updates and rejects a name already used by another active option', async () => {
    const service = new NamedOptionService(new InMemoryRepository<TestOption>(generateId, now));
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
