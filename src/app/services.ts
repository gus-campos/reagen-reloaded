import dayjs from 'dayjs';
import { appDatabase } from '@/database/app.database';
import { DexieRepository } from '@/database/repositories/dexie.repository';
import { PackageService } from '@/features/package/package.service';
import { ReagentService } from '@/features/reagent/reagent.service';
import { VialService } from '@/features/vial/vial.service';

export {
  acquirerService,
  controlAgencyService,
  laboratoryService,
  supplierService,
} from '@/features/named-options/options.services';

const now = () => dayjs();

export const reagentService = new ReagentService(
  new DexieRepository(appDatabase.reagents, undefined, now),
);

export const packageService = new PackageService(
  new DexieRepository(appDatabase.packages, undefined, now),
);

export const vialService = new VialService(
  new DexieRepository(appDatabase.vials, undefined, now),
);
