import type {
  CascadeRemovalImpact,
  CascadeRemovalResult,
} from '@/features/named-options/cascade-removal.type';
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

export function useNamedOptionCrud<TEntity extends NamedOption<Id<string>>>(
  service: NamedOptionService<TEntity>,
  onCascadeRemoved: (result: CascadeRemovalResult) => void,
) {
  const crud = useEntityCrud(service, {
    remove: async (id) => {
      const result = await service.removeWithCascade(id);
      if (!result) return false;

      // Pode ser usado para sincronizar a store com o banco. Ver usos.
      onCascadeRemoved(result);
      return true;
    },
  });

  function previewRemoval(id: TEntity['id']): Promise<CascadeRemovalImpact | null> {
    return service.previewRemoval(id);
  }

  return { ...crud, previewRemoval };
}
