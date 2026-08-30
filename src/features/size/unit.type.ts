export enum Unit {
  Kilogram = 'kg',
  Gram = 'g',
  Milligram = 'mg',
  Liter = 'L',
  Milliliter = 'mL',
  Mol = 'mol',
  Units = 'un.',
}

export enum Dimension {
  Mass = 'Massa',
  Volume = 'Volume',
  Count = 'Contagem',
  Matter = 'Quantidade de matéria',
}

export const dimensionDefaultUnit: Record<Dimension, Unit> = {
  [Dimension.Mass]: Unit.Gram,
  [Dimension.Volume]: Unit.Milliliter,
  [Dimension.Count]: Unit.Units,
  [Dimension.Matter]: Unit.Mol,
};

export const unitDimension: Record<Unit, Dimension> = {
  [Unit.Kilogram]: Dimension.Mass,
  [Unit.Gram]: Dimension.Mass,
  [Unit.Milligram]: Dimension.Mass,
  [Unit.Liter]: Dimension.Volume,
  [Unit.Milliliter]: Dimension.Volume,
  [Unit.Mol]: Dimension.Matter,
  [Unit.Units]: Dimension.Count,
};

export const unitMultiplier: Record<Unit, number> = {
  [Unit.Kilogram]: 1000,
  [Unit.Gram]: 1,
  [Unit.Milligram]: 0.001,
  [Unit.Liter]: 1,
  [Unit.Milliliter]: 0.001,
  [Unit.Mol]: 1,
  [Unit.Units]: 1,
};
