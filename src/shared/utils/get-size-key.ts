import type { Size } from '@/shared/types/size.type';

// Identifica um tamanho pelo seu valor, para comparações e chaves de lista.
export function getSizeKey(size: Size): string {
  return `${size.amount}-${size.unit}`;
}
