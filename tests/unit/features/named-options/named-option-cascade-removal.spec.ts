import { describe, expect, it } from 'vitest';
import { generateId, now } from '@/infrastructure/database/persistence.dependencies';
import { Dimension, Unit } from '@/shared/types/unit.type';
import { createInMemoryCascadeRemoval } from '@tests/unit/features/named-options/named-option.test-utils';
import { InMemoryRepository } from '@tests/utils/in-memory.repository';
import { AcquirerService } from '@/features/named-options/acquirer.service';
import { ControlAgencyService } from '@/features/named-options/control-agency.service';
import { LaboratoryService } from '@/features/named-options/laboratory.service';
import type {
  Acquirer,
  ControlAgency,
  Laboratory,
  Supplier,
} from '@/features/named-options/options.type';
import { SupplierService } from '@/features/named-options/supplier.service';
import type { PackageService } from '@/features/package/package.service';
import type { Package } from '@/features/package/package.type';
import type { ReagentService } from '@/features/reagent/reagent.service';
import type { Reagent } from '@/features/reagent/reagent.type';

function createSut() {
  const cascade = createInMemoryCascadeRemoval();

  return {
    ...cascade,
    controlAgencyService: new ControlAgencyService(
      new InMemoryRepository<ControlAgency>(generateId, now),
      cascade.dependencies,
    ),
    acquirerService: new AcquirerService(
      new InMemoryRepository<Acquirer>(generateId, now),
      cascade.dependencies,
    ),
    laboratoryService: new LaboratoryService(
      new InMemoryRepository<Laboratory>(generateId, now),
      cascade.dependencies,
    ),
    supplierService: new SupplierService(
      new InMemoryRepository<Supplier>(generateId, now),
      cascade.dependencies,
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

describe('named option cascade removal', () => {
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

    await expect(sut.controlAgencyService.previewRemoval(agency.id)).resolves.toEqual({
      reagents: 1,
      packages: 1,
      vials: 1,
    });
    await expect(sut.controlAgencyService.removeWithCascade(agency.id)).resolves.toEqual({
      impact: { reagents: 1, packages: 1, vials: 1 },
      reagentIds: new Set([reagent.id]),
      packageIds: new Set([packageItem.id]),
      vialIds: new Set([vial.id]),
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

    await expect(sut.acquirerService.removeWithCascade(acquirer.id)).resolves.toMatchObject({
      impact: { reagents: 0, packages: 1, vials: 1 },
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

    await expect(sut.supplierService.removeWithCascade(supplier.id)).resolves.toMatchObject({
      impact: { reagents: 0, packages: 1, vials: 1 },
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

    await expect(sut.laboratoryService.removeWithCascade(laboratory.id)).resolves.toMatchObject({
      impact: { reagents: 0, packages: 0, vials: 1 },
    });

    await expect(sut.reagentService.get(reagent.id)).resolves.not.toBeNull();
    await expect(sut.packageService.get(packageItem.id)).resolves.not.toBeNull();
    await expect(sut.vialService.get(vial.id)).resolves.toBeNull();
  });
});
