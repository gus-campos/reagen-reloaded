import { describe, expect, it } from 'vitest';
import { now } from '@/infrastructure/database/persistence.dependencies';
import type { LaboratoryId } from '@/features/named-options/options.type';
import type { PackageService } from '@/features/package/package.service';
import type { Reagent } from '@/features/reagent/reagent.type';
import type { Size } from '@/shared/types/size.type';
import { Dimension, Unit } from '@/shared/types/unit.type';
import { createInMemoryReagentService } from '@tests/unit/features/reagent/reagent.test-utils';

const LITER: Size = { amount: 1, unit: Unit.Liter };
const HALF_LITER: Size = { amount: 500, unit: Unit.Milliliter };

async function createSut() {
  const sut = createInMemoryReagentService();
  const reagent = await sut.reagentService.create({
    name: 'Ácido sulfúrico',
    dimension: Dimension.Volume,
    sizes: [LITER, HALF_LITER],
    controlAgencyId: null,
  });
  return { ...sut, reagent };
}

function createPackage(service: PackageService, reagentId: Reagent['id'], size: Size) {
  return service.create({
    size,
    purity: 99,
    inDate: now(),
    expireDate: now().add(1, 'year'),
    reagentId,
    acquirerId: null,
    supplierId: null,
  });
}

describe('ReagentService update', () => {
  it('removes packages and vials of the removed sizes, keeping the others', async () => {
    const sut = await createSut();
    const literPackage = await createPackage(sut.packageService, sut.reagent.id, LITER);
    const halfLiterPackage = await createPackage(sut.packageService, sut.reagent.id, HALF_LITER);
    const vial = await sut.vialService.create({
      packageId: literPackage.id,
      laboratoryId: 'lab' as LaboratoryId,
      outDate: null,
    });

    await expect(
      sut.reagentService.previewUpdate(sut.reagent.id, { sizes: [HALF_LITER] }),
    ).resolves.toEqual({
      reagents: 0,
      packages: 1,
      vials: 1,
    });
    await expect(
      sut.reagentService.updateWithCascade(sut.reagent.id, { sizes: [HALF_LITER] }),
    ).resolves.toMatchObject({
      reagent: { id: sut.reagent.id, sizes: [HALF_LITER] },
      removal: { packageIds: new Set([literPackage.id]), vialIds: new Set([vial.id]) },
    });

    expect(sut.transactionCount()).toBe(1);
    await expect(sut.packageService.get(literPackage.id)).resolves.toBeNull();
    await expect(sut.vialService.get(vial.id)).resolves.toBeNull();
    await expect(sut.packageService.get(halfLiterPackage.id)).resolves.not.toBeNull();
  });

  it('applies the cascade through the inherited update as well', async () => {
    const sut = await createSut();
    const literPackage = await createPackage(sut.packageService, sut.reagent.id, LITER);

    await expect(
      sut.reagentService.update(sut.reagent.id, { sizes: [HALF_LITER] }),
    ).resolves.toMatchObject({ sizes: [HALF_LITER] });

    await expect(sut.packageService.get(literPackage.id)).resolves.toBeNull();
  });

  it('removes nothing when no size is removed', async () => {
    const sut = await createSut();
    const literPackage = await createPackage(sut.packageService, sut.reagent.id, LITER);

    await expect(
      sut.reagentService.previewUpdate(sut.reagent.id, { name: 'Ácido sulfúrico P.A.' }),
    ).resolves.toEqual({ reagents: 0, packages: 0, vials: 0 });
    await sut.reagentService.update(sut.reagent.id, { name: 'Ácido sulfúrico P.A.' });

    await expect(sut.packageService.get(literPackage.id)).resolves.not.toBeNull();
  });

  it('rejects a dimension change', async () => {
    const sut = await createSut();

    await expect(
      sut.reagentService.update(sut.reagent.id, { dimension: Dimension.Mass }),
    ).rejects.toThrow('A dimensão do reagente não pode ser alterada.');
    await expect(sut.reagentService.get(sut.reagent.id)).resolves.toMatchObject({
      dimension: Dimension.Volume,
    });
  });

  it('returns null when the reagent does not exist', async () => {
    const { reagentService } = createInMemoryReagentService();
    const missingId = 'missing' as Reagent['id'];

    await expect(reagentService.previewUpdate(missingId, { name: 'X' })).resolves.toBeNull();
    await expect(reagentService.update(missingId, { name: 'X' })).resolves.toBeNull();
  });
});
