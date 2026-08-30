import type { Entity, Id } from '@/database/persistence.types';

export type NamedOption<TId extends Id<string>> = Entity<TId> & {
  name: string;
};
