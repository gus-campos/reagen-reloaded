import type { TransactionRunner } from '@/features/named-options/cascade-removal.type';
import { PackageService } from '@/features/package/package.service';
import type { ReagentRepository } from '@/features/reagent/reagent.repository';
import { ReagentService } from '@/features/reagent/reagent.service';
import { VialService } from '@/features/vial/vial.service';
import { generateId, now } from '@/infrastructure/database/persistence.dependencies';
import {
  InMemoryPackageRepository,
  InMemoryReagentRepository,
  InMemoryVialRepository,
} from '@tests/utils/in-memory-feature-repositories';

// ReagentService em memória, com as dependências da edição e contando as transações abertas.
export function createInMemoryReagentService(
  repository: ReagentRepository = new InMemoryReagentRepository(generateId, now),
) {
  let transactionCount = 0;
  const runInTransaction: TransactionRunner = async (operation) => {
    transactionCount++;
    return operation();
  };

  const packageService = new PackageService(new InMemoryPackageRepository(generateId, now));
  const vialService = new VialService(new InMemoryVialRepository(generateId, now));
  const reagentService = new ReagentService(repository, {
    runInTransaction,
    packageService,
    vialService,
  });

  return {
    runInTransaction,
    reagentService,
    packageService,
    vialService,
    transactionCount: () => transactionCount,
  };
}
