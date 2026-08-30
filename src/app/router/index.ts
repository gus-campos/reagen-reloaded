import { createRouter, createWebHistory } from 'vue-router';
import { authenticationRoutes } from '@/features/authentication/authentication.routes';
import { registrationsRoutes } from '@/features/registrations/registrations.routes';

// Filhos herdam meta do pai, logo será o layout pai, a menos que sobrescrito
const routes = [{ path: '/', redirect: '/cadastros' }, ...authenticationRoutes, ...registrationsRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
