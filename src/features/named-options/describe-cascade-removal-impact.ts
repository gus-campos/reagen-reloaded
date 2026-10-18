import type { CascadeRemovalImpact } from '@/features/named-options/named-option-cascade-removal.service';

const IMPACT_LABELS: Record<keyof CascadeRemovalImpact, [singular: string, plural: string]> = {
  reagents: ['reagente', 'reagentes'],
  packages: ['embalagem', 'embalagens'],
  vials: ['frasco', 'frascos'],
};

// Retorna null quando a remoção não afeta nenhum outro registro.
export function describeCascadeRemovalImpact(impact: CascadeRemovalImpact): string | null {
  const parts = (Object.keys(IMPACT_LABELS) as (keyof CascadeRemovalImpact)[])
    .filter((key) => impact[key] > 0)
    .map((key) => {
      const [singular, plural] = IMPACT_LABELS[key];
      return `${impact[key]} ${impact[key] === 1 ? singular : plural}`;
    });

  if (parts.length === 0) return null;

  return `Também serão removidos: ${parts.join(', ')}.`;
}
