import AuthView from '@/views/AuthView.vue';
import TableView from '@/views/TableView.vue';
import { createRouter, createWebHistory } from 'vue-router';

// Filhos herdam meta do pai, logo será o layout pai, a menos que sobrescrito
const routes = [
  {
    path: '/',
    meta: { layout: 'authenticated' },
    children: [{ path: '', component: TableView }],
  },
  {
    path: '/auth',
    meta: { layout: 'base' },
    children: [{ path: '', component: AuthView }],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
