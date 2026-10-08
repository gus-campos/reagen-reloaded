import { describe, expect, it } from 'vitest';
import { generateId, now } from '@/infrastructure/database/persistence.dependencies';
import { Dimension, Unit } from '@/shared/types/unit.type';
import { InMemoryRepository } from '@tests/utils/in-memory.repository';
import {
  InMemoryPackageRepository,
  InMemoryReagentRepository,
  InMemoryVialRepository,
} from '@tests/utils/in-memory-feature-repositories';
import {
  NamedOptionCascadeRemovalService,
  type TransactionRunner,
} from '@/features/named-options/named-option-cascade-removal.service';
import { NamedOptionService } from '@/features/named-options/named-option.service';
import type {
  Acquirer,
  ControlAgency,
  Laboratory,
  Supplier,
} from '@/features/named-options/options.type';
import { PackageService } from '@/features/package/package.service';
import type { Package } from '@/features/package/package.type';
import { ReagentService } from '@/features/reagent/reagent.service';
import type { Reagent } from '@/features/reagent/reagent.type';
import { VialService } from '@/features/vial/vial.service';

function createSut() {
  const controlAgencyService = new NamedOptionService<ControlAgency>(
    new InMemoryRepository<ControlAgency>(generateId, now),
  );
  const acquirerService = new NamedOptionService<Acquirer>(
    new InMemoryRepository<Acquirer>(generateId, now),
  );
  const laboratoryService = new NamedOptionService<Laboratory>(
    new InMemoryRepository<Laboratory>(generateId, now),
  );
  const supplierService = new NamedOptionService<Supplier>(
    new InMemoryRepository<Supplier>(generateId, now),
  );
  const reagentService = new ReagentService(new InMemoryReagentRepository(generateId, now));
  const packageService = new PackageService(new InMemoryPackageRepository(generateId, now));
  const vialService = new VialService(new InMemoryVialRepository(generateId, now));
  let transactionCount = 0;
  const runInTransaction: TransactionRunner = async (operation) => {
    transactionCount++;
    return operation();
  };

  return {
    controlAgencyService,
    acquirerService,
    laboratoryService,
    supplierService,
    reagentService,
    packageService,
    vialService,
    transactionCount: () => transactionCount,
    service: new NamedOptionCascadeRemovalService(
      runInTransaction,
      controlAgencyService,
      acquirerService,
      laboratoryService,
      supplierService,
      reagentService,
      packageService,
      vialService,
    ),
  };
}

async function createReagent(
  service: ReagentService,
  controlAgencyId: Reagent['controlAgencyId'] = null,
) {
  return service.create({
    name: 'Ácido sulfúrico',
    dimension: Dimension.Volume,
    sizes: [{ amount: 1, unit: Unit.Liter }],
    controlAgencyId,
  });
}

async function createPackage(
  service: PackageService,
  reagentId: Reagent['id'],
  overrides: Partial<Pick<Package, 'acquirerId' | 'supplierId'>> = {},
) {
  return service.create({
    size: { amount: 1, unit: Unit.Liter },
    purity: 99,
    inDate: now(),
    expireDate: now().add(1, 'year'),
    reagentId,
    acquirerId: null,
    supplierId: null,
    ...overrides,
  });
}

describe('NamedOptionCascadeRemovalService', () => {
  it('removes a control agency and all its reagents, packages and vials', async () => {
    const sut = createSut();
    const agency = await sut.controlAgencyService.create('Exército');
    const reagent = await createReagent(sut.reagentService, agency.id);
    const packageItem = await createPackage(sut.packageService, reagent.id);
    const laboratory = await sut.laboratoryService.create('Central');
    const vial = await sut.vialService.create({
      packageId: packageItem.id,
      laboratoryId: laboratory.id,
      outDate: null,
    });

    await expect(sut.service.preview({ kind: 'control-agency', id: agency.id })).resolves.toEqual({
      reagents: 1,
      packages: 1,
      vials: 1,
    });
    await expect(sut.service.remove({ kind: 'control-agency', id: agency.id })).resolves.toEqual({
      reagents: 1,
      packages: 1,
      vials: 1,
    });

    expect(sut.transactionCount()).toBe(1);
    await expect(sut.controlAgencyService.get(agency.id)).resolves.toBeNull();
    await expect(sut.reagentService.get(reagent.id)).resolves.toBeNull();
    await expect(sut.packageService.get(packageItem.id)).resolves.toBeNull();
    await expect(sut.vialService.get(vial.id)).resolves.toBeNull();
    await expect(sut.reagentService.get(reagent.id, { getDeleted: true })).resolves.not.toBeNull();
  });

  it('removes packages and vials associated with an acquirer, preserving reagents', async () => {
    const sut = createSut();
    const acquirer = await sut.acquirerService.create('Fapesp');
    const reagent = await createReagent(sut.reagentService);
    const packageItem = await createPackage(sut.packageService, reagent.id, {
      acquirerId: acquirer.id,
    });
    const laboratory = await sut.laboratoryService.create('Central');
    const vial = await sut.vialService.create({
      packageId: packageItem.id,
      laboratoryId: laboratory.id,
      outDate: null,
    });

    await expect(sut.service.remove({ kind: 'acquirer', id: acquirer.id })).resolves.toEqual({
      reagents: 0,
      packages: 1,
      vials: 1,
    });

    await expect(sut.reagentService.get(reagent.id)).resolves.not.toBeNull();
    await expect(sut.packageService.get(packageItem.id)).resolves.toBeNull();
    await expect(sut.vialService.get(vial.id)).resolves.toBeNull();
  });

  it('removes packages and vials associated with a supplier', async () => {
    const sut = createSut();
    const supplier = await sut.supplierService.create('Sigma');
    const reagent = await createReagent(sut.reagentService);
    const packageItem = await createPackage(sut.packageService, reagent.id, {
      supplierId: supplier.id,
    });
    const laboratory = await sut.laboratoryService.create('Central');
    const vial = await sut.vialService.create({
      packageId: packageItem.id,
      laboratoryId: laboratory.id,
      outDate: null,
    });

    await expect(sut.service.remove({ kind: 'supplier', id: supplier.id })).resolves.toEqual({
      reagents: 0,
      packages: 1,
      vials: 1,
    });

    await expect(sut.packageService.get(packageItem.id)).resolves.toBeNull();
    await expect(sut.vialService.get(vial.id)).resolves.toBeNull();
  });

  it('removes only vials associated with a laboratory', async () => {
    const sut = createSut();
    const reagent = await createReagent(sut.reagentService);
    const packageItem = await createPackage(sut.packageService, reagent.id);
    const laboratory = await sut.laboratoryService.create('Central');
    const vial = await sut.vialService.create({
      packageId: packageItem.id,
      laboratoryId: laboratory.id,
      outDate: null,
    });

    await expect(sut.service.remove({ kind: 'laboratory', id: laboratory.id })).resolves.toEqual({
      reagents: 0,
      packages: 0,
      vials: 1,
    });

    await expect(sut.reagentService.get(reagent.id)).resolves.not.toBeNull();
    await expect(sut.packageService.get(packageItem.id)).resolves.not.toBeNull();
    await expect(sut.vialService.get(vial.id)).resolves.toBeNull();
  });
});
