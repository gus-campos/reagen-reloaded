import { createRouter, createWebHistory } from 'vue-router';
import { registrationsRoutes } from '@/features/registrations/registrations.routes';
import LoginView from '@/features/authentication/LoginView.vue';

// Filhos herdam meta do pai, logo será o layout pai, a menos que sobrescrito
const routes = [
  { path: '/', redirect: '/cadastros' },
  {
    path: '/auth',
    component: LoginView,
    meta: { layout: 'base' },
  },
  ...registrationsRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
