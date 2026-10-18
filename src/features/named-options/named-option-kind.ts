import type {
  Acquirer,
  ControlAgency,
  Laboratory,
  Supplier,
} from '@/features/named-options/options.type';

export type NamedOptionByKind = {
  'control-agency': ControlAgency;
  acquirer: Acquirer;
  laboratory: Laboratory;
  supplier: Supplier;
};

export type NamedOptionKind = keyof NamedOptionByKind;

export type NamedOptionKindConfig = {
  path: string;
  label: string;
  plural: string;
};

export const NAMED_OPTION_KINDS = {
  'control-agency': {
    path: 'orgaos-de-controle',
    label: 'Órgão de controle',
    plural: 'Órgãos de controle',
  },
  acquirer: { path: 'adquirentes', label: 'Adquirente', plural: 'Adquirentes' },
  laboratory: { path: 'laboratorios', label: 'Laboratório', plural: 'Laboratórios' },
  supplier: { path: 'fornecedores', label: 'Fornecedor', plural: 'Fornecedores' },
} as const satisfies Record<NamedOptionKind, NamedOptionKindConfig>;

export const NAMED_OPTION_KIND_LIST = Object.keys(NAMED_OPTION_KINDS) as NamedOptionKind[];
