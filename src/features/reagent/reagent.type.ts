import type z from 'zod';
import type { Entity, Id } from '@/infrastructure/database/persistence.types';
import type { reagentSchema } from '@/features/reagent/reagent-schema';

export type ReagentId = Id<'Reagent'>;

export type Reagent = Entity<ReagentId> & z.infer<typeof reagentSchema>;
