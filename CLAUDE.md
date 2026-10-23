# Padrões gerais do projeto

## Stack

- Gerenciador de pacotes: Yarn
- Linguagem: TypeScript
- Framework: Vue 3
- Ecossistema Vue:
  - Vue Router: roteamento SPA
  - Vee Validate: validação de formulários
  - Pinia: gerenciamento de estado
- Biblioteca de componentes: Element Plus -> PrimeVue?
- Bibliotecas gerais:
  - Dayjs em vez de `Date`
  - Axios em vez de `fetch`
  - Zod para validação
- Estilização:
  - SCSS com o pré-processador Sass
  - `<style>` sempre `scoped`
- Dev tools:
  - Linter: ESLint + Oxlint
  - Formatter: Prettier
- Testes:
  - Vitest: testes unitários
- Extensões:
  - unplugin-vue-components

## Padrões

- Sistema de endereçamento relativo, que facilite mover e renomear arquivos.
- Só usar subpasta quando houver muitos arquivos.

Nomes de pastas e arquivos:

- Componentes: PascalCase
- Outros: kebab-case
- Composables sempre com o prefixo `use`

Formatação:

- Ponto e vírgula obrigatório: `"semi": true`
- `"trailingComma": true`

### Vue

- Composition API.
- Single File Components (`.vue`), com template, script e style no mesmo arquivo (style nunca dentro do template).
- Nome do componente igual ao do arquivo (tornar obrigatório pelo linter e renomear automaticamente?).
  - Usar unplugin-vue-components? Ver mais em template.
- Vee Validate com Zod, fazendo pelo Zod todas as validações possíveis.
- Todos os imports com caminho absoluto pelo alias `@`.

#### Organização do script

Script do componente organizado por tipo, omitindo as seções vazias:

```ts
// PROPS
// EMITS
// MODELS

// SCHEMA
// FORM
// FIELDS

// REFS
// COMPUTEDS
// WATCHERS

// HELPERS
// HANDLERS
// LIFECYCLE
```

#### Nomes de funções

- `handleXpto`: reage a um evento.
- `onXpto`: evitar em componentes; preferir `emit` para comunicação com o componente pai.
- Sem prefixo: lógica de domínio dentro do componente.

## Estrutura de diretórios

Organizada por features, com os testes ao lado do arquivo. Dá para criar subpastas quando necessário, ou deixar os arquivos direto na raiz quando possível.

```
src/
├── app/
│   ├── router/
│   │   └── index.ts
│   ├── app-store.ts
│   └── main.ts
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.vue
│   │   ├── use-auth.ts
│   │   ├── auth-service.ts
│   │   ├── auth-store.ts
│   │   ├── login-schema.ts
│   │   └── types.ts
│   │
│   ├── users/
│   │   ├── components/
│   │   │   └── UserCard.vue
│   │   ├── use-users.ts
│   │   ├── user-service.ts
│   │   ├── user-schema.ts
│   │   ├── UsersView.vue
│   │   └── types.ts
│   │
│   └── products/
│       ├── components/
│       │   ├── ProductCard.vue
│       │   ├── ProductForm.vue
│       │   ├── ProductFilters.vue
│       │   └── table/
│       │       ├── ProductTable.vue
│       │       └── ProductTableRow.vue
│       ├── views/
│       │   ├── ProductsView.vue
│       │   └── ProductDetailsView.vue
│       ├── use-products.ts
│       ├── product-service.ts
│       ├── product-store.ts
│       ├── product-schema.ts
│       └── types.ts
│
├── shared/
│   ├── components/
│   │   ├── BaseButton.vue
│   │   └── BaseModal.vue
│   ├── api/
│   │   ├── http-client.ts
│   │   └── api-error.ts
│   ├── utils/
│   │   └── format-date.ts
│   └── composables/
│       └── use-pagination.ts
│
└── assets/
    ├── images/
    └── styles/

test/
└── (espelha os diretórios de src)
```

## Rotas e layouts

Cada rota declara o layout que usa em `meta.layout`, e um componente central (`App.vue`) decide dinamicamente qual layout renderizar.

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    meta: { layout: 'padrao' },
    children: [
      { path: '', component: () => import('@/views/Home.vue') },
      { path: 'dashboard', component: () => import('@/views/Dashboard.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: { layout: 'auth' },
  },
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { layout: 'padrao' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
```
# Arquitetura da aplicação

Este documento complementa o `stack.md` e detalha como cada camada (services, stores, composables, forms, componentes e roteamento) deve ser estruturada dentro do padrão de features já definido.

---
## 1. Services
Responsabilidade única: **comunicação com a API**. Não conhece Pinia, nem componentes, nem lógica de UI. Recebe/retorna tipos puros (ou instâncias de erro tratadas).

```ts
// features/products/product-service.ts
import { httpClient } from '@/shared/api/http-client';
import type { Product, ProductPayload } from '@/features/products/types';

export const productService = {
  async list(): Promise<Product[]> {
    const { data } = await httpClient.get<Product[]>('/products');
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await httpClient.get<Product>(`/products/${id}`);
    return data;
  },

  async create(payload: ProductPayload): Promise<Product> {
    const { data } = await httpClient.post<Product>('/products', payload);
    return data;
  },

  async update(id: string, payload: ProductPayload): Promise<Product> {
    const { data } = await httpClient.put<Product>(`/products/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/products/${id}`);
  },
};
```

**Regras:**
- Um objeto exportado por arquivo (`xxxService`), métodos como verbos (`list`, `getById`, `create`, `update`, `remove`).
- Erros não são tratados aqui — sobem para quem chamou (store ou composable), que decide como exibir (toast, mensagem de campo, etc.).
- `http-client.ts` (em `shared/api/`) centraliza instância do Axios: baseURL, interceptors de auth, tratamento genérico de erro de rede, normalização de erro em `ApiError` (`shared/api/api-error.ts`).

---

## 2. Stores (Pinia)
Usar store **só quando o estado precisa ser compartilhado entre múltiplos componentes/rotas** (ex.: usuário autenticado, carrinho, filtros persistentes de listagem). Estado local de uma tela isolada não vira store — fica em `ref`/`reactive` dentro do componente ou de um composable.

```ts
// features/products/product-store.ts
import { defineStore } from 'pinia';
import { productService } from '@/features/products/product-service';
import type { Product } from '@/features/products/types';

export const useProductStore = defineStore('product', () => {
  // STATE
  const products = ref<Product[]>([]);
  const isLoading = ref(false);

  // GETTERS
  const activeProducts = computed(() =>
    products.value.filter((p) => p.active)
  );

  // ACTIONS
  async function fetchAll() {
    isLoading.value = true;
    try {
      products.value = await productService.list();
    } finally {
      isLoading.value = false;
    }
  }

  return { products, isLoading, activeProducts, fetchAll };
});
```

**Regras:**

- Setup stores (Composition API), coerente com o resto do projeto.
- Nome do arquivo: `xxx-store.ts`, store id igual ao domínio no singular (`'product'`).
- Não faz `try/catch` silencioso escondendo erro — deixa propagar ou expõe um `error` reativo para quem consome decidir a UI.
- Store não formata dado para exibição (isso é do componente/composable de apresentação).

---

## 3. Composables (`use-*`)
Ponte entre a UI e services/stores. É onde mora orquestração: loading, erro amigável, debounce, paginação, etc. Um composable pode usar uma store, um service, ou ambos.

```ts
// features/products/use-products.ts
export function useProducts() {
  const store = useProductStore();
  const { products, isLoading } = storeToRefs(store);

  const error = ref<string | null>(null);

  async function load() {
    error.value = null;
    try {
      await store.fetchAll();
    } catch (err) {
      error.value = 'Não foi possível carregar os produtos.';
    }
  }

  return { products, isLoading, error, load };
}
```

**Regras:**

- Sempre prefixado com `use`.
- Se a lógica não é reutilizada em nenhum outro lugar e é pequena, pode viver direto no `<script setup>` do componente (evita composable "vazio" só por convenção).
- Composables de propósito geral (paginação, debounce, etc.) vão para `shared/` (ex.: `use-pagination.ts`).

---
## 4. Forms (Vee Validate + Zod)
### 4.1 Schema
```ts
// features/products/product-schema.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.number().positive('Preço deve ser maior que zero'),
  category: z.string().min(1, 'Selecione uma categoria'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
```

Toda validação possível (formato, obrigatoriedade, ranges, regras cruzadas com `.refine`) fica no Zod — o componente não reimplementa regra de validação.

### 4.2 Componente de formulário
```vue
<!-- features/products/components/ProductForm.vue -->
<script setup lang="ts">

// PROPS

interface Props {
  initialValues?: Partial<ProductFormValues>;
}
const props = defineProps<Props>();

// EMITS

const emit = defineEmits<{
  submit: [values: ProductFormValues];
}>();

// SCHEMA

const validationSchema = toTypedSchema(productSchema);

// FORM

const { handleSubmit, isSubmitting } = useForm<ProductFormValues>({
  validationSchema,
  initialValues: props.initialValues,
});

// FIELDS

const { value: name, errorMessage: nameError } = useField<string>('name');
const { value: price, errorMessage: priceError } = useField<number>('price');
const { value: category, errorMessage: categoryError } = useField<string>('category');

// HANDLERS

const onSubmit = handleSubmit((values) => {
  emit('submit', values);
});
</script>

<template>
  <form @submit.prevent="onSubmit">
    <el-form-item :error="nameError">
      <el-input v-model="name" placeholder="Nome" />
    </el-form-item>

    <el-form-item :error="priceError">
      <el-input-number v-model="price" />
    </el-form-item>

    <el-form-item :error="categoryError">
      <el-input v-model="category" placeholder="Categoria" />
    </el-form-item>

    <el-button type="primary" native-type="submit" :loading="isSubmitting">
      Salvar
    </el-button>
  </form>
</template>

<style scoped lang="scss">
</style>
```

**Regras:**

- Componente de form nunca chama `service`/`store` diretamente — apenas emite os valores validados (`emit('submit', values)`). Quem decide o que fazer com o submit (chamar service, redirecionar, mostrar toast) é a `View` pai ou um composable.
- Um form = um schema = um arquivo `xxx-schema.ts` ao lado do form.
- Reaproveitar pedaços de schema comuns (ex.: `email`, `cpf`, `paginação`) em `shared/common-schemas.ts`.

### 4.3 View consumindo o form
```vue
<!-- features/products/views/ProductCreateView.vue -->
<script setup lang="ts">
const { create } = useProducts();
const router = useRouter();

async function handleSubmit(values: ProductFormValues) {
  await create(values);
  router.push({ name: 'products' });
}
</script>

<template>
  <ProductForm @submit="handleSubmit" />
</template>
```

---

## 5. Componentes

### 5.1 Tipos de componente
- **View** (`XxxView.vue`): amarrada a uma rota, orquestra composables/stores e monta os componentes de apresentação. Não tem lógica de negócio pesada.
- **Componente de feature** (`features/xxx/components/`): conhece o domínio (`ProductCard`, `ProductForm`), mas não conhece rota.
- **Componente compartilhado** (`shared/components/`): agnóstico de domínio (`BaseButton`, `BaseModal`), reaproveitável em qualquer feature.

### 5.2 Comunicação
- Dado desce via **props**, evento sobe via **emit**. Evitar acessar store de dentro de componente de apresentação puro sempre que possível — preferir receber via props e devolver via emit, deixando a View como orquestradora.
- Exceção aceitável: componentes fortemente acoplados ao domínio (ex.: `ProductFilters` lendo direto de `useProductStore`) quando o acoplamento com a store já é intrínseco ao componente.

### 5.3 Registro automático
Com `unplugin-vue-components`, os componentes de `shared/components` (e opcionalmente os de `features/*/components`) ficam disponíveis sem import manual — mantendo o nome do arquivo igual ao nome do componente (regra já definida no stack), o auto-import fica previsível.

### 5.4 Estrutura interna (recap do padrão de agrupamento)
Vale tanto para View quanto para componente de feature:

```ts
// PROPS / EMITS / MODELS
// SCHEMA / FORM / FIELDS   (se aplicável)
// REFS / COMPUTEDS / WATCHERS
// HELPERS / HANDLERS / LIFECYCLE
```

---

## 6. Roteamento (Vue Router)

### 6.1 Rotas por feature
Cada feature declara suas próprias rotas em um arquivo local, e o router central apenas agrega:
```ts
// features/products/routes.ts
import type { RouteRecordRaw } from 'vue-router';

export const productRoutes: RouteRecordRaw[] = [
  {
    path: '/products',
    name: 'products',
    component: () => import('@/features/products/views/ProductsView.vue'),
  },
  {
    path: '/products/:id',
    name: 'product-details',
    component: () => import('@/features/products/views/ProductDetailsView.vue'),
    props: true,
  },
];
```

```ts
// app/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { productRoutes } from '@/features/products/routes';
import { authRoutes } from '@/features/auth/routes';
import { requireAuth } from '@/app/router/guards';

const router = createRouter({
  history: createWebHistory(),
  routes: [...authRoutes, ...productRoutes],
});

router.beforeEach(requireAuth);

export default router;
```

**Regras:**
- Sempre lazy-load (`() => import(...)`) — impacto direto no bundle inicial.
- Guards genéricos (auth, permissões) ficam em `app/router/guards.ts`; guards específicos de uma feature podem ficar dentro do próprio `routes.ts` da feature via `meta` + guard genérico lendo o `meta`.
- `name` da rota em kebab-case, usado para navegação programática (`router.push({ name: '...' })`) em vez de path hardcoded.
- Rotas "utilitárias" (404, login) ficam em `shared/routes.ts` ou em uma feature `core`/`app`, conforme a rota `index.ts` já sugere no stack.

### 6.2 Route meta
```ts
{
  path: '/products',
  name: 'products',
  component: () => import('@/features/products/views/ProductsView.vue'),
  meta: { requiresAuth: true, title: 'Produtos' },
}
```

Usado pelos guards e por um listener global (`afterEach`) para setar `document.title`, breadcrumbs, etc.

---

## 7. Tratamento de erros — visão geral do fluxo
```
Service          → lança ApiError (sem tratar)
Store/Composable → captura, decide estado (error.value / toast) 
Componente/View  → apenas exibe o que veio pronto (mensagem, estado de loading)
```
Isso evita duplicar `try/catch` em todo componente e mantém a camada de apresentação "burra" — só reage a estado.

---

## 8. Resumo por arquivo (dentro de uma feature)

|Arquivo|Responsabilidade|
|---|---|
|`xxx-service.ts`|Chamadas HTTP puras|
|`xxx-store.ts`|Estado compartilhado entre telas|
|`use-xxx.ts`|Orquestração (service/store) + estado de UI (loading/erro)|
|`xxx-schema.ts`|Validação Zod|
|`types.ts`|Tipos de domínio da feature|
|`components/XxxForm.vue`|Formulário — só emite valores validados|
|`components/XxxCard.vue`|Apresentação, recebe via props|
|`views/XxxView.vue`|Orquestra composables + monta componentes|
|`routes.ts`|Rotas da feature|
|`tests/*.spec.ts`|Testes ao lado do que testam|

---

## 9. Ordem de dependência (quem pode chamar quem)
```
View  →  Composable  →  Store  →  Service  →  http-client
View  →  Composable  →  Service  →  http-client   (quando não precisa de estado compartilhado)
Componente de apresentação  →  (nada; só props/emit)
```
Nunca o inverso (service não conhece store; store não conhece componente).