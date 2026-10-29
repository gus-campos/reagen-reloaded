import type { CascadeRemovalDependencies } from '@/features/named-options/cascade-removal.type';
import { createInMemoryReagentService } from '@tests/unit/features/reagent/reagent.test-utils';

// Dependências da remoção em cascata em memória, contando as transações abertas.
export function createInMemoryCascadeRemoval() {
  const { runInTransaction, reagentService, packageService, vialService, transactionCount } =
    createInMemoryReagentService();

  const dependencies: CascadeRemovalDependencies = {
    runInTransaction,
    reagentService,
    packageService,
    vialService,
  };

  return { ...dependencies, dependencies, transactionCount };
}
