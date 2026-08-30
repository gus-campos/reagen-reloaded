import type { Acquirer, ControlAgency, Laboratory, Supplier } from '@/features/named-options/options.type';
import { NamedOptionService } from '@/features/named-options/shared/named-option.service';

export class ControlAgencyService extends NamedOptionService<ControlAgency> {}

export class LaboratoryService extends NamedOptionService<Laboratory> {}

export class AcquirerService extends NamedOptionService<Acquirer> {}

export class SupplierService extends NamedOptionService<Supplier> {}
