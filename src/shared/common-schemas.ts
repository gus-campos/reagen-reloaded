import z from 'zod';
import { Unit } from '@/shared/types/unit.type';

export const sizeSchema = z.object({
  amount: z.number('Informe uma quantidade positiva').positive('Informe uma quantidade positiva'),
  unit: z.enum(Unit),
});
