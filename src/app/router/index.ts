import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/features/authentication/LoginView.vue';
import RegistrationsLayoutView from '@/features/registrations/RegistrationsLayoutView.vue';

// Filhos herdam meta do pai, logo será o layout pai, a menos que sobrescrito
const routes = [
  { path: '/', redirect: '/cadastros' },
  {
    path: '/auth',
    component: LoginView,
    meta: { layout: 'base' },
  },
  {
    path: '/cadastros',
    component: RegistrationsLayoutView,
    meta: { layout: 'authenticated' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
