import type { Id } from '@/infrastructure/database/persistence.types';
import type { NamedOption } from '@/features/named-options/named-option.type';

export type ControlAgencyId = Id<'ControlAgency'>;
export type ControlAgency = NamedOption<ControlAgencyId>;

export type SupplierId = Id<'Supplier'>;
export type Supplier = NamedOption<SupplierId>;

export type LaboratoryId = Id<'Laboratory'>;
export type Laboratory = NamedOption<LaboratoryId>;

export type AcquirerId = Id<'Acquirer'>;
export type Acquirer = NamedOption<AcquirerId>;
