import type {
  CascadeRemovalDependencies,
  TransactionRunner,
} from '@/features/named-options/cascade-removal.type';
import { PackageService } from '@/features/package/package.service';
import { ReagentService } from '@/features/reagent/reagent.service';
import { VialService } from '@/features/vial/vial.service';
import { generateId, now } from '@/infrastructure/database/persistence.dependencies';
import {
  InMemoryPackageRepository,
  InMemoryReagentRepository,
  InMemoryVialRepository,
} from '@tests/utils/in-memory-feature-repositories';

// Dependências da remoção em cascata em memória, contando as transações abertas.
export function createInMemoryCascadeRemoval() {
  let transactionCount = 0;
  const runInTransaction: TransactionRunner = async (operation) => {
    transactionCount++;
    return operation();
  };

  const dependencies: CascadeRemovalDependencies = {
    runInTransaction,
    reagentService: new ReagentService(new InMemoryReagentRepository(generateId, now)),
    packageService: new PackageService(new InMemoryPackageRepository(generateId, now)),
    vialService: new VialService(new InMemoryVialRepository(generateId, now)),
  };

  return { ...dependencies, dependencies, transactionCount: () => transactionCount };
}
