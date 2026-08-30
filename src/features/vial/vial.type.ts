import type { Dayjs } from 'dayjs';
import type { Entity, Id } from '@/database/persistence.types';
import type { LaboratoryId } from '@/features/named-options/laboratory.type';
import type { PackageId } from '@/features/package/package.type';

export type VialId = Id<'Vial'>;

export type Vial = Entity<VialId> & {
  packageId: PackageId;
  laboratoryId: LaboratoryId;
  outDate: Dayjs | null;
};
