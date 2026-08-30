import type { Acquirer, ControlAgency, Laboratory, Supplier } from './options.type';
import { NamedOptionService } from './shared/named-option.service';

export class ControlAgencyService extends NamedOptionService<ControlAgency> {}

export class LaboratoryService extends NamedOptionService<Laboratory> {}

export class AcquirerService extends NamedOptionService<Acquirer> {}

export class SupplierService extends NamedOptionService<Supplier> {}
