import type { Entity, Id } from '@/infrastructure/database/persistence.types';

export type NamedOption<TId extends Id<string>> = Entity<TId> & { name: string };
