import type { Dayjs } from 'dayjs';
import type { Entity, Id } from '@/database/persistence.types';
import type { ReagentId } from '@/features/reagent/reagent.type';
import type { Size } from '@/features/size/size.type';
import type { AcquirerId, SupplierId } from '@/features/named-options/options.type';

export type PackageId = Id<'Package'>;

export type Package = Entity<PackageId> & {
  size: Size;
  purity: number;
  inDate: Dayjs;
  expireDate: Dayjs;
  reagentId: ReagentId;
  acquirerId: AcquirerId | null;
  supplierId: SupplierId | null;
};
