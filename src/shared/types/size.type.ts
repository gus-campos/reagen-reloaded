import type z from 'zod';
import type { sizeSchema } from '@/shared/common-schemas';

export type Size = z.infer<typeof sizeSchema>;
