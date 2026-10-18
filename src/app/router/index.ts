import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/features/authentication/LoginView.vue';
import {
  NAMED_OPTION_KINDS,
  NAMED_OPTION_KIND_LIST,
} from '@/features/named-options/named-option-kind';
import NamedOptionsView from '@/features/named-options/components/NamedOptionsView.vue';
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
    children: [
      { path: '', redirect: `/cadastros/${NAMED_OPTION_KINDS['control-agency'].path}` },
      ...NAMED_OPTION_KIND_LIST.map((kind) => ({
        path: NAMED_OPTION_KINDS[kind].path,
        component: NamedOptionsView,
        props: { kind },
      })),
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
