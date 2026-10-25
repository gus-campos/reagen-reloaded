# reagen-reloaded

Aplicação web para **controle de estoque de reagentes de laboratório**. Ela cadastra os reagentes, as embalagens adquiridas e os frascos distribuídos aos laboratórios, junto com as entidades de apoio (órgãos de controle, adquirentes, fornecedores e laboratórios).

Este projeto substitui uma implementação anterior feita em React. A reescrita em Vue tem dois objetivos: concentrar o desenvolvimento em uma única stack e servir de estudo dessa stack (Vue 3, Pinia, Vuetify, Vee Validate, Zod etc.).

Hoje a aplicação roda **inteira no navegador**: os dados ficam no IndexedDB (via [Dexie](https://dexie.org/)) e não há backend por enquato, que será conectado posteriormente.

> **Status:** em desenvolvimento. Já existem os cadastros de reagentes e de opções nomeadas. Embalagens e frascos estão modelados até a camada de serviço, mas ainda não têm tela. O login é só um formulário de exemplo, sem autenticação de fato.

## Modelo de domínio

```
Órgão de controle ──┐
                    ▼
                Reagente ──► Embalagem ──► Frasco
                              ▲    ▲         ▲
                 Adquirente ──┘    │         │
                 Fornecedor ───────┘         │
                 Laboratório ────────────────┘
```

| Entidade | Descrição |
|---|---|
| **Reagente** | Nome, dimensão (massa, volume, contagem, quantidade de matéria), tamanhos disponíveis e órgão de controle (opcional). |
| **Embalagem** (`Package`) | Uma unidade comprada de um reagente: tamanho, pureza, data de entrada, validade, adquirente e fornecedor. |
| **Frasco** (`Vial`) | Uma embalagem enviada a um laboratório, com data de saída. |
| **Opções nomeadas** | Entidades que só têm nome: órgãos de controle, adquirentes, fornecedores e laboratórios. |

Todas as entidades têm `id` (UUID com tipo *branded*), `createdAt`, `updatedAt` e `deletedAt`.

## Como executar

Pré-requisitos: **Node `^22.18` ou `>=24.12`** e **Yarn 4** (versão fixada em `packageManager`; habilite com `corepack enable`).

```sh
yarn            # instala as dependências
yarn dev        # servidor de desenvolvimento com hot reload
```

Outros scripts:

| Comando | O que faz |
|---|---|
| `yarn build` | Faz o type-check (`vue-tsc`) e o build de produção em paralelo |
| `yarn preview` | Serve o build de produção localmente |
| `yarn test:unit` | Roda os testes unitários (Vitest) |
| `yarn lint` | Roda Oxlint e ESLint, os dois com `--fix` |
| `yarn format` | Formata `src/` e `tests/` com Prettier |

## Stack

- **Vue 3** (Composition API, `<script setup>`) + **TypeScript** + **Vite**
- **Vuetify** como biblioteca de componentes, com ícones `@mdi/font`
- **Vue Router**, com layouts por rota
- **Pinia** (setup stores)
- **Vee Validate + Zod** para formulários
- **Dexie** (IndexedDB) para persistência
- **Dayjs** para datas
- **SCSS** com `<style scoped>`
- **unplugin-vue-components** para registrar componentes automaticamente
- **Vitest + Vue Test Utils + jsdom** para testes
- **ESLint + Oxlint + Prettier** para lint e formatação

## Estrutura

```
src/
├── main.ts                  # bootstrap: Pinia, Router, Vuetify
├── app/
│   ├── App.vue              # escolhe o layout a partir de route.meta.layout
│   ├── composition/         # composition root: instancia serviços e stores
│   ├── layouts/             # BaseLayout, AuthenticatedLayout, use-route-layout
│   ├── plugins/             # configuração do Vuetify
│   ├── router/              # definição central das rotas
│   └── styles/
├── features/                # uma pasta por domínio
│   ├── authentication/
│   ├── named-options/       # CRUD genérico + remoção em cascata
│   ├── reagent/
│   ├── package/
│   ├── vial/
│   └── registrations/       # tela "Cadastros", com abas
├── infrastructure/
│   └── database/            # schema Dexie, interface Repository e implementações
└── shared/                  # serviços, composables, schemas, tipos e utilitários genéricos

tests/
├── unit/                    # espelha a estrutura de src/
└── utils/                   # repositórios em memória para testes
```

## Arquitetura e decisões principais

### Camadas

```
View/Componente → Store (Pinia) → Service → Repository (interface) → Dexie
```

- **Repository** (`infrastructure/database/repository.ts`): interface genérica de CRUD. A implementação concreta é a `DexieRepository`, e as entidades que precisam de consultas específicas (`findByReagentIds`, `findByLaboratoryId`…) a estendem.
- **Service**: regras de domínio sobre o repositório. Todos herdam de `EntityService`, e as opções nomeadas compartilham um único `NamedOptionService<T>`.
- **Store**: estado reativo e compartilhado, montado pelos composables genéricos `useEntityCrud` e `useNamedOptionCrud` (`items`, `loading`, `error`, `load`, `create`, `update`, `remove`, `evict`).
- **Componentes**: os formulários só emitem valores já validados. Quem persiste é a View, pela store.

### Composition root e injeção de dependência

As dependências são ligadas em um único lugar, `src/app/composition/`. É lá que repositórios, serviços e stores são instanciados. Os serviços recebem o repositório, o gerador de ID e o relógio (`now`) pelo construtor. Com isso:

- o restante do código não depende de Dexie;
- os testes trocam o banco pelo `InMemoryRepository` (`tests/utils/`) sem precisar de mocks globais;
- trocar o IndexedDB por uma API HTTP no futuro só exige implementar `Repository` de novo.

### Soft delete e remoção em cascata

Nada é apagado fisicamente. Remover uma entidade só preenche `deletedAt`, e as leituras ignoram registros removidos, a não ser que recebam `getDeleted: true`.

Remover uma opção nomeada pode deixar dependentes órfãos. Por exemplo, remover um órgão de controle afeta seus reagentes, que afetam embalagens, que afetam frascos. O `NamedOptionCascadeRemovalService` cuida disso:

1. `preview()` calcula o impacto (quantos reagentes, embalagens e frascos serão removidos) para o diálogo de confirmação;
2. `remove()` **refaz o plano dentro de uma transação Dexie** e remove tudo de forma atômica. Assim o resultado reflete o estado atual do banco, e não o estado de quando o preview foi feito;
3. as stores afetadas descartam os itens removidos com `evict()`, sem recarregar tudo.

### Tipagem

- **IDs branded** (`Id<'Reagent'>`, `Id<'Package'>`…): o compilador impede passar o ID de uma entidade onde se espera o de outra.
- **Tipos derivados do Zod**: o tipo `Reagent` vem de `z.infer<typeof reagentSchema>`, então o schema de validação é a fonte única da forma dos dados.
- `CreationDto`/`UpdateDto` são derivados da entidade, sem os campos gerenciados (`id`, timestamps).

### Opções nomeadas genéricas

Órgãos de controle, adquirentes, fornecedores e laboratórios têm a mesma forma. Por isso usam um **único conjunto** de view, serviço e composable, parametrizado por `NamedOptionKind`. A configuração de cada tipo (rota, rótulo, plural) fica em `named-option-kind.ts`. As rotas e as abas de "Cadastros" são geradas a partir dela.

### Layouts por rota

Cada rota declara `meta.layout` (`base` ou `authenticated`), e `App.vue` renderiza o layout correspondente. As rotas filhas herdam o layout da rota pai.

### Validação

Toda regra que dá para expressar em Zod fica no schema, inclusive as que cruzam campos com `.refine`, como "as unidades dos tamanhos precisam ser da dimensão escolhida". Os componentes não reimplementam validação.

### Migrações de banco

O schema do IndexedDB é versionado em `app.database.ts`. Mudanças de modelo entram como uma nova `version(n)` com `upgrade()`. Foi assim que `fundingSources` virou `acquirers` sem perder dados.

## Convenções

As convenções de código (nomes de arquivos, organização do `<script setup>`, imports absolutos com `@/`, estilo) estão em [`CLAUDE.md`](CLAUDE.md). Resumo:

- Componentes em `PascalCase.vue`; os outros arquivos em `kebab-case`, com sufixo de papel (`.service.ts`, `.repository.ts`, `.type.ts`, `-schema.ts`).
- Composables com prefixo `use`.
- Imports sempre pelo alias `@/` (e `@tests/` nos testes).
- Prettier: aspas simples, ponto e vírgula, `trailingComma: "all"` e largura de 100 colunas.
- Testes ficam em `tests/unit/`, espelhando o caminho do arquivo testado em `src/`.

## Ambiente recomendado

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar). O `vite-plugin-vue-devtools` já vem configurado.
