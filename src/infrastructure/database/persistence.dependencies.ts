import dayjs, { type Dayjs } from 'dayjs';
import type { Id } from '@/infrastructure/database/persistence.types';

export function generateId<TId extends Id<string>>(): TId {
  return crypto.randomUUID() as TId;
}

export function now(): Dayjs {
  return dayjs();
}
