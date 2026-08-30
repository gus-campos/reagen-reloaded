import type { Dayjs } from 'dayjs';
import type { Entity, Id } from '@/database/persistence.types';
import type { FundingSourceId } from '@/features/named-options/funding-source.type';
import type { ReagentId } from '@/features/reagent/reagent.type';
import type { Size } from '@/features/size/size.type';
import type { SupplierId } from '@/features/named-options/supplier.type';

export type PackageId = Id<'Package'>;

export type Package = Entity<PackageId> & {
  size: Size;
  purity: number;
  inDate: Dayjs;
  expireDate: Dayjs;
  reagentId: ReagentId;
  fundingSourceId: FundingSourceId | null;
  supplierId: SupplierId | null;
};
