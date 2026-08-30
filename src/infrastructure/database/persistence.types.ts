import type { Dayjs } from 'dayjs';

declare const brand: unique symbol;

export type Brand<T, TName extends string> = T & {
  readonly [brand]: TName;
};

export type Id<TName extends string> = Brand<string, TName>;

export interface Entity<TId extends Id<string>> {
  id: TId;
  createdAt: Dayjs;
  updatedAt: Dayjs;
  deletedAt: Dayjs | null;
}

export type ManagedFields = keyof Entity<Id<string>>;
