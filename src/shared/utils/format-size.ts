import type { Size } from '@/shared/types/size.type';

export function formatSize(size: Size): string {
  return `${size.amount.toLocaleString('pt-BR')} ${size.unit}`;
}
