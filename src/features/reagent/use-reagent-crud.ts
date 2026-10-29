import type {
  CascadeRemovalImpact,
  CascadeRemovalResult,
} from '@/features/named-options/cascade-removal.type';
import type { ReagentService } from '@/features/reagent/reagent.service';
import type { Reagent } from '@/features/reagent/reagent.type';
import type { UpdateDto } from '@/infrastructure/database/repository';
import { useEntityCrud } from '@/shared/composables/use-entity-crud';

export function useReagentCrud(
  service: ReagentService,
  onCascadeRemoved: (result: CascadeRemovalResult) => void,
) {
  const crud = useEntityCrud(service, {
    update: async (id, dto) => {
      const result = await service.updateWithCascade(id, dto);
      if (!result) return null;

      // Embalagens e frascos removidos junto precisam sair também das suas stores.
      onCascadeRemoved(result.removal);
      return result.reagent;
    },
  });

  function previewUpdate(
    id: Reagent['id'],
    dto: UpdateDto<Reagent>,
  ): Promise<CascadeRemovalImpact | null> {
    return service.previewUpdate(id, dto);
  }

  return { ...crud, previewUpdate };
}
