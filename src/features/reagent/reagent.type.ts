import type { Entity, Id } from '@/database/persistence.types';
import type { ControlAgencyId } from '@/features/named-options/options.type';
import type { Size } from '@/features/size/size.type';
import type { Dimension } from '@/features/size/unit.type';

export type ReagentId = Id<'Reagent'>;

export type Reagent = Entity<ReagentId> & {
  name: string;
  dimension: Dimension;
  sizes: Size[];
  controlAgencyId: ControlAgencyId | null;
};
