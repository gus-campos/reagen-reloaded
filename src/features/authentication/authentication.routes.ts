import type { RouteRecordRaw } from 'vue-router';
import LoginView from '@/features/authentication/views/LoginView.vue';

export const authenticationRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: LoginView,
    meta: { layout: 'base' },
  },
];
