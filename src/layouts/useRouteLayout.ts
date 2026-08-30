import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import BaseLayout from '@/layouts/BaseLayout.vue';

const LAYOUTS = {
  base: BaseLayout,
  authenticated: AuthenticatedLayout,
};
type LayoutKey = keyof typeof LAYOUTS;

export function useRouteLayout() {
  const route = useRoute();
  const layoutKey = (route.meta?.layout ?? null) as LayoutKey | null;

  if (layoutKey && !(layoutKey in LAYOUTS)) {
    throw new Error(
      `Layout key "${layoutKey}" not found. Available: ${Object.keys(LAYOUTS).join(', ')}`,
    );
  }

  const layout = computed(() => (!layoutKey ? null : LAYOUTS[layoutKey]));
  return { layout };
}
