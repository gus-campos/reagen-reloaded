import type { Supplier } from './supplier.type';
import type { Laboratory } from './laboratory.type';
import type { ControlAgency } from './options.type';
import type { FundingSource } from './funding-source.type';
import { NamedOptionService } from './shared/named-option.service';

export class ControlAgencyService extends NamedOptionService<ControlAgency> {}

export class LaboratoryService extends NamedOptionService<Laboratory> {}

export class FundingSourceService extends NamedOptionService<FundingSource> {}

export class SupplierService extends NamedOptionService<Supplier> {}
