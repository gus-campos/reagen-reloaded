import type { Entity, Id } from '@/infrastructure/database/persistence.types';
import type { ControlAgencyId } from '@/features/named-options/options.type';
import type { Size } from '@/shared/measurement/size.type';
import type { Dimension } from '@/shared/measurement/unit.type';

export type ReagentId = Id<'Reagent'>;

export type Reagent = Entity<ReagentId> & {
  name: string;
  dimension: Dimension;
  sizes: Size[];
  controlAgencyId: ControlAgencyId | null;
};
