import type { Entity, Id } from '@/infrastructure/database/persistence.types';
import type { ControlAgencyId } from '@/features/named-options/options.type';
import type { Size } from '@/shared/types/size.type';
import type { Dimension } from '@/shared/types/unit.type';

export type ReagentId = Id<'Reagent'>;

export type Reagent = Entity<ReagentId> & {
  name: string;
  dimension: Dimension;
  sizes: Size[];
  controlAgencyId: ControlAgencyId | null;
};
