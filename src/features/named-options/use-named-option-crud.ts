import type {
  CascadeRemovalImpact,
  CascadeRemovalResult,
  NamedOptionCascadeRemovalService,
  NamedOptionRemovalTarget,
} from '@/features/named-options/named-option-cascade-removal.service';
import type {
  NamedOptionByKind,
  NamedOptionKind,
} from '@/features/named-options/named-option-kind';
import type { NamedOptionService } from '@/features/named-options/named-option.service';
import type { NamedOption } from '@/features/named-options/named-option.type';
import type { Id } from '@/infrastructure/database/persistence.types';
import { useEntityCrud } from '@/shared/composables/use-entity-crud';

// Visão uniforme das stores de opções nomeadas, para componentes que tratam qualquer tipo.
export interface NamedOptionStore {
  readonly items: readonly NamedOption<Id<string>>[];
  readonly loading: boolean;
  readonly error: Error | null;
  load(): Promise<void>;
  create(dto: { name: string }): Promise<unknown>;
  update(id: Id<string>, dto: { name: string }): Promise<unknown>;
  remove(id: Id<string>): Promise<boolean>;
  previewRemoval(id: Id<string>): Promise<CascadeRemovalImpact | null>;
}

export function useNamedOptionCrud<TKind extends NamedOptionKind>(
  kind: TKind,
  service: NamedOptionService<NamedOptionByKind[TKind]>,
  removalService: NamedOptionCascadeRemovalService,
  onCascadeRemoved: (result: CascadeRemovalResult) => void,
) {
  type OptionId = NamedOptionByKind[TKind]['id'];

  // O TypeScript não correlaciona `kind` e `id` genéricos com a união discriminada.
  const target = (id: OptionId) => ({ kind, id }) as NamedOptionRemovalTarget;

  const crud = useEntityCrud(service, {
    async remove(id) {
      const result = await removalService.remove(target(id));
      if (!result) return false;

      onCascadeRemoved(result);
      return true;
    },
  });

  function previewRemoval(id: OptionId): Promise<CascadeRemovalImpact | null> {
    return removalService.preview(target(id));
  }

  return { ...crud, previewRemoval };
}
