import { describe, expect, it } from 'vitest';
import { generateId, now } from '@/infrastructure/database/persistence.dependencies';
import type { Entity, Id } from '@/infrastructure/database/persistence.types';
import { EntityService } from '@/shared/services/entity.service';
import { InMemoryRepository } from '@tests/utils/in-memory.repository';

type TestEntity = Entity<Id<'TestEntity'>> & { name: string };

describe('EntityService', () => {
  it('returns only active records after a soft delete', async () => {
    const service = new EntityService(new InMemoryRepository<TestEntity>(generateId, now));
    const entity = await service.create({ name: 'Opção' });

    await expect(service.getAll()).resolves.toMatchObject([{ id: entity.id }]);
    await expect(service.remove(entity.id)).resolves.toBe(true);
    await expect(service.getAll()).resolves.toEqual([]);
  });

  it('updates an active record and preserves its identity', async () => {
    const service = new EntityService(new InMemoryRepository<TestEntity>(generateId, now));
    const entity = await service.create({ name: 'Antes' });

    await expect(service.update(entity.id, { name: 'Depois' })).resolves.toMatchObject({
      id: entity.id,
      name: 'Depois',
    });
  });
});
