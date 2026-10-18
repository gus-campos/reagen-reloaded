import { describe, expect, it } from 'vitest';
import { describeCascadeRemovalImpact } from '@/features/named-options/describe-cascade-removal-impact';

describe('describeCascadeRemovalImpact', () => {
  it('returns null when nothing else is affected', () => {
    expect(describeCascadeRemovalImpact({ reagents: 0, packages: 0, vials: 0 })).toBeNull();
  });

  it('uses the singular form for a single affected record', () => {
    expect(describeCascadeRemovalImpact({ reagents: 0, packages: 0, vials: 1 })).toBe(
      'Também serão removidos: 1 frasco.',
    );
  });

  it('lists every affected entity, omitting the ones with no records', () => {
    expect(describeCascadeRemovalImpact({ reagents: 3, packages: 0, vials: 12 })).toBe(
      'Também serão removidos: 3 reagentes, 12 frascos.',
    );
    expect(describeCascadeRemovalImpact({ reagents: 1, packages: 5, vials: 12 })).toBe(
      'Também serão removidos: 1 reagente, 5 embalagens, 12 frascos.',
    );
  });
});
