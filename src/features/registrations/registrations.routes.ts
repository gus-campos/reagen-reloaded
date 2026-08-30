import type { RouteRecordRaw } from 'vue-router';
import RegistrationsLayoutView from '@/features/registrations/views/RegistrationsLayoutView.vue';

export const registrationsRoutes: RouteRecordRaw[] = [
  {
    path: '/cadastros',
    component: RegistrationsLayoutView,
    meta: { layout: 'authenticated' },
  },
];
