import z from 'zod';
import type { ControlAgencyId } from '@/features/named-options/options.type';
import { sizeSchema } from '@/shared/common-schemas';
import { Dimension, unitDimension } from '@/shared/types/unit.type';
import { getSizeKey } from '@/shared/utils/get-size-key';

export const sizesSchema = z
  .array(sizeSchema)
  .min(1, 'Adicione ao menos um tamanho')
  .refine((sizes) => new Set(sizes.map(getSizeKey)).size === sizes.length, 'Tamanho já adicionado');

export const reagentSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe um nome'),
    dimension: z.enum(Dimension),
    sizes: sizesSchema,
    controlAgencyId: z.custom<ControlAgencyId>((value) => typeof value === 'string').nullable(),
  })
  .refine(
    (reagent) => reagent.sizes.every((size) => unitDimension[size.unit] === reagent.dimension),
    { message: 'Os tamanhos devem usar unidades da dimensão escolhida', path: ['sizes'] },
  );
