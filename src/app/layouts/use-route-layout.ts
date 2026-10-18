import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AuthenticatedLayout from '@/app/layouts/AuthenticatedLayout.vue';
import BaseLayout from '@/app/layouts/BaseLayout.vue';

const LAYOUTS = { base: BaseLayout, authenticated: AuthenticatedLayout };
type LayoutKey = keyof typeof LAYOUTS;

export function useRouteLayout() {
  const route = useRoute();

  // Lido dentro do computed para reagir à navegação entre rotas com layouts diferentes.
  const layout = computed(() => {
    const layoutKey = (route.meta?.layout ?? null) as LayoutKey | null;
    if (!layoutKey) return null;

    if (!(layoutKey in LAYOUTS)) {
      throw new Error(`Layout key "${layoutKey}" not found.`);
    }

    return LAYOUTS[layoutKey];
  });

  return { layout };
}
