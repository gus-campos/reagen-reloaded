<script setup lang="ts">
  import { computed } from 'vue';
  import type { ControlAgency, ControlAgencyId } from '@/features/named-options/options.type';
  import type { Reagent } from '@/features/reagent/reagent.type';
  import { formatSize } from '@/shared/utils/format-size';
  import { getSizeKey } from '@/shared/utils/get-size-key';

  const HEADERS = [
    { title: 'Nome', key: 'name' },
    { title: 'Dimensão', key: 'dimension' },
    { title: 'Tamanhos', key: 'sizes', sortable: false },
    { title: 'Órgão de controle', key: 'controlAgencyId', sortable: false },
    { title: '', key: 'actions', sortable: false, align: 'end' as const },
  ];

  const props = defineProps<{
    items: readonly Reagent[];
    controlAgencies: readonly ControlAgency[];
    loading: boolean;
  }>();

  const emit = defineEmits<{
    edit: [reagent: Reagent];
  }>();

  const controlAgencyNames = computed(
    () => new Map(props.controlAgencies.map((agency) => [agency.id, agency.name])),
  );

  function controlAgencyName(id: ControlAgencyId | null): string {
    return (id && controlAgencyNames.value.get(id)) || '—';
  }
</script>

<template>
  <v-data-table
    :headers="HEADERS"
    :items="items"
    :loading="loading"
    item-value="id"
    no-data-text="Nenhum registro cadastrado."
  >
    <template #[`item.sizes`]="{ item }">
      <v-chip
        v-for="size in item.sizes"
        :key="getSizeKey(size)"
        :text="formatSize(size)"
        size="small"
        class="me-1"
      />
    </template>

    <template #[`item.controlAgencyId`]="{ item }">
      {{ controlAgencyName(item.controlAgencyId) }}
    </template>

    <template #[`item.actions`]="{ item }">
      <v-btn
        icon="mdi-pencil"
        variant="text"
        size="small"
        :aria-label="`Editar ${item.name}`"
        @click="emit('edit', item)"
      />
    </template>
  </v-data-table>
</template>
