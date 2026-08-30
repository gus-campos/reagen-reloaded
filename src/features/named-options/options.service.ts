import type { ControlAgency, FundingSource, Laboratory, Supplier } from './options.type';
import { NamedOptionService } from './shared/named-option.service';

export class ControlAgencyService extends NamedOptionService<ControlAgency> {}

export class LaboratoryService extends NamedOptionService<Laboratory> {}

export class FundingSourceService extends NamedOptionService<FundingSource> {}

export class SupplierService extends NamedOptionService<Supplier> {}
